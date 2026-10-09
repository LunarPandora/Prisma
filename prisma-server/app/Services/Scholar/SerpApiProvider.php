<?php

namespace App\Services\Scholar;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class SerpApiProvider implements GoogleScholarProvider
{
    private string $apiKey;
    private int $timeout;

    public function __construct()
    {
        $this->apiKey = config('services.serpapi.key', '');
        $this->timeout = (int) config('services.serpapi.timeout', 30);
    }

    public function fetchAuthorProfile(string $scholarAuthorId): array
    {
        if (empty($this->apiKey)) {
            throw new \RuntimeException('SerpApi key is not configured.');
        }

        $allPublications = [];
        $page = 0;

        Log::info('Scholar: Starting author profile fetch', [
            'author_id' => $scholarAuthorId,
        ]);

        while (true) {
            $requestStart = microtime(true);

            $response = Http::timeout($this->timeout)
                ->get('https://serpapi.com/search.json', [
                    'engine'      => 'google_scholar_author',
                    'author_id'   => $scholarAuthorId,
                    'api_key'     => $this->apiKey,
                    'start'       => $page * 10,
                    'num'         => 10,
                ]);

            $elapsed = round((microtime(true) - $requestStart) * 1000);

            if ($response->failed()) {
                Log::error('Scholar: SerpApi request failed', [
                    'author_id' => $scholarAuthorId,
                    'page'      => $page,
                    'status'    => $response->status(),
                    'elapsed_ms'=> $elapsed,
                ]);
                throw new \RuntimeException('SerpApi request failed with status ' . $response->status());
            }

            $data = $response->json();

            if ($page === 0) {
                $profile = $this->normalizeProfile($data);
                $citationsByYear = $this->normalizeCitationsByYear($data);
            }

            $publications = $this->normalizePublications($data);
            $allPublications = array_merge($allPublications, $publications);

            Log::info('Scholar: Fetched page', [
                'author_id'       => $scholarAuthorId,
                'page'            => $page,
                'pubs_on_page'    => count($publications),
                'total_pubs_so_far'=> count($allPublications),
                'elapsed_ms'      => $elapsed,
            ]);

            $next = $data['serpapi_pagination']['next'] ?? null;
            if (empty($next) || count($publications) === 0 || $page >= 9) {
                break;
            }
            $page++;
        }

        Log::info('Scholar: Author profile fetch complete', [
            'author_id'       => $scholarAuthorId,
            'total_publications'=> count($allPublications),
            'pages_fetched'   => $page + 1,
        ]);

        return [
            'profile'          => $profile ?? $this->emptyProfile(),
            'citations_by_year'=> $citationsByYear ?? [],
            'publications'     => $allPublications,
        ];
    }

    private function normalizeProfile(array $data): array
    {
        $author = $data['author'] ?? [];
        $citedBy = $data['cited_by'] ?? [];
        $table = $citedBy['table'] ?? [];

        return [
            'name'            => $author['name'] ?? null,
            'affiliation'     => $author['affiliations'] ?? null,
            'total_citations' => (int) ($table[0]['citations']['all'] ?? 0),
            'h_index'         => (int) ($table[1]['h_index']['all'] ?? 0),
            'i10_index'       => (int) ($table[2]['i10_index']['all'] ?? 0),
        ];
    }

    private function normalizeCitationsByYear(array $data): array
    {
        $results = [];

        foreach ($data['cited_by']['graph'] ?? [] as $entry) {
            $year = (int) ($entry['year'] ?? 0);
            if ($year > 0) {
                $results[] = [
                    'year'           => $year,
                    'citation_count' => (int) ($entry['citations'] ?? 0),
                ];
            }
        }

        return $results;
    }

    private function normalizePublications(array $data): array
    {
        $results = [];

        foreach ($data['articles'] ?? [] as $pub) {
            $results[] = [
                'external_id'     => $pub['citation_id'] ?? null,
                'title'           => $pub['title'] ?? '',
                'authors'         => $pub['authors'] ?? null,
                'publication_name'=> $pub['publication'] ?? null,
                'publication_year'=> isset($pub['year']) ? (int) $pub['year'] : null,
                'citation_count'  => (int) ($pub['cited_by']['value'] ?? 0),
                'publication_url' => $pub['link'] ?? null,
            ];
        }

        return $results;
    }

    public function fetchPublicationCitationHistory(string $scholarAuthorId, string $citationId): array
    {
        if (empty($this->apiKey)) {
            throw new \RuntimeException('SerpApi key is not configured.');
        }

        $response = Http::timeout($this->timeout)
            ->get('https://serpapi.com/search.json', [
                'engine'      => 'google_scholar_author',
                'author_id'   => $scholarAuthorId,
                'view_op'     => 'view_citation',
                'citation_id' => $citationId,
                'api_key'     => $this->apiKey,
            ]);

        if ($response->failed()) {
            Log::error('SerpApi citation request failed', [
                'author_id'    => $scholarAuthorId,
                'citation_id'  => $citationId,
                'status'       => $response->status(),
            ]);
            throw new \RuntimeException('SerpApi citation request failed with status ' . $response->status());
        }

        $data = $response->json();

        $citation = $data['citation'] ?? [];
        $totalCitations = $citation['total_citations'] ?? [];
        $table = $totalCitations['table'] ?? [];

        $results = [];
        foreach ($table as $entry) {
            $year = (int) ($entry['year'] ?? 0);
            if ($year > 0) {
                $results[] = [
                    'year'           => $year,
                    'citation_count' => (int) ($entry['citations'] ?? 0),
                ];
            }
        }

        usort($results, fn ($a, $b) => $a['year'] <=> $b['year']);

        return $results;
    }

    private function emptyProfile(): array
    {
        return [
            'name'            => null,
            'affiliation'     => null,
            'total_citations' => 0,
            'h_index'         => 0,
            'i10_index'       => 0,
        ];
    }
}
