<?php

namespace App\Services\Scholar;

interface GoogleScholarProvider
{
    /**
     * Fetch author profile, citation history, and publications.
     *
     * @return array{
     *     profile: array{name: ?string, affiliation: ?string, total_citations: int, h_index: int, i10_index: int},
     *     citations_by_year: array<int, array{year: int, citation_count: int}>,
     *     publications: array<int, array{external_id: ?string, title: string, authors: ?string, publication_name: ?string, publication_year: ?int, citation_count: int, publication_url: ?string}>,
     * }
     */
    public function fetchAuthorProfile(string $scholarAuthorId): array;

    /**
     * Fetch per-publication citation history (citations per year).
     *
     * @param string $scholarAuthorId The Google Scholar author ID.
     * @param string $citationId The publication's citation_id (external_id).
     * @return array<int, array{year: int, citation_count: int}> Sorted by year ascending.
     */
    public function fetchPublicationCitationHistory(string $scholarAuthorId, string $citationId): array;
}
