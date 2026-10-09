<?php
$files = glob(__DIR__ . '/database/seeders/E2E{Staff,Dosen,Ketua,Reviewer,Superadmin}Seeder.php', GLOB_BRACE);

foreach ($files as $file) {
    $lines = file($file);
    $output = [];
    $i = 0;
    $changes = 0;

    while ($i < count($lines)) {
        $line = $lines[$i];

        if (preg_match('/(\$\w+)\s*=\s*User::create\(\[/', $line, $m)) {
            $var = $m[1];
            $email = null;
            $attrLines = [];

            $i++; // skip "User::create([" line
            while ($i < count($lines)) {
                $attrLine = $lines[$i];
                // End of User::create array
                if (preg_match('/^\s*\]\);/', $attrLine)) {
                    $i++;
                    break;
                }

                // Check if this line has the email on it (possibly alongside nama)
                if (preg_match("/'email'\s*=>\s*'([^']+)'/", $attrLine, $eMatch)) {
                    $email = $eMatch[1];

                    // Check if this line has ONLY email, or email+other fields
                    // Remove just the 'email' => '...' part, keep the rest
                    $cleaned = preg_replace("/'email'\s*=>\s*'[^']+',?\s*/", "", $attrLine);
                    $cleaned = rtrim(trim($cleaned), ',');

                    if ($cleaned !== '' && $cleaned !== "'nama'") {
                        // There are other fields on this line besides email
                        $attrLines[] = $cleaned . ",\n";
                    } elseif ($cleaned !== '') {
                        $attrLines[] = $cleaned . ",\n";
                    }
                    // If cleaned is empty, the line only had email — skip it
                } else {
                    $attrLines[] = $attrLine;
                }
                $i++;
            }

            if ($email) {
                $changes++;
                $output[] = "        {$var} = User::firstOrCreate(\n";
                $output[] = "            ['email' => '{$email}'],\n";
                $output[] = "            [\n";
                foreach ($attrLines as $a) {
                    $output[] = $a;
                }
                $output[] = "            ]\n";
                $output[] = "        );\n";
            } else {
                // No email found, keep original
                $output[] = $line;
                foreach ($attrLines as $a) {
                    $output[] = $a;
                }
                $output[] = "        ];\n";
            }
        } else {
            $output[] = $line;
            $i++;
        }
    }

    if ($changes > 0) {
        file_put_contents($file, implode('', $output));
        echo basename($file) . ": {$changes} transformations\n";
    } else {
        echo basename($file) . ": no changes\n";
    }
}
