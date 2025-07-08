# PowerShell Script to download a branch from a GitHub repository

$repo = "bensheed/Kalibran"
$apiUrl = "https://api.github.com/repos/$repo/branches"

Write-Host "Fetching branches from $repo..."

try {
    # Get all branches from the GitHub API
    $branches = Invoke-RestMethod -Uri $apiUrl -Method Get

    # Get the last commit date for each branch
    $branchDetails = foreach ($branch in $branches) {
        $commitUrl = "https://api.github.com/repos/$repo/commits/$($branch.commit.sha)"
        $commit = Invoke-RestMethod -Uri $commitUrl -Method Get
        [pscustomobject]@{
            Name = $branch.name
            LastCommit = $commit.commit.author.date
        }
    }

    # Sort branches by the last commit date in descending order
    $sortedBranches = $branchDetails | Sort-Object -Property LastCommit -Descending

    # Display a numbered list of branches
    Write-Host "Please select a branch to download:"
    for ($i = 0; $i -lt $sortedBranches.Length; $i++) {
        Write-Host ("{0}. {1}" -f ($i + 1), $sortedBranches[$i].Name)
    }

    # Prompt the user to select a branch
    $selection = Read-Host -Prompt "Enter the number of the branch"

    # Validate the user's selection
    if ($selection -match "^\d+$" -and [int]$selection -gt 0 -and [int]$selection -le $sortedBranches.Length) {
        $selectedBranch = $sortedBranches[[int]$selection - 1].Name
        Write-Host "You selected: $selectedBranch"

        # Sanitize the branch name for use in a filename by replacing '/' with '-'
        $safeBranchName = $selectedBranch.Replace('/', '-')
        
        # Download the selected branch
        $zipUrl = "https://github.com/$repo/archive/refs/heads/$selectedBranch.zip"
        $outputFile = "$safeBranchName.zip"
        Write-Host "Downloading $zipUrl..."
        Invoke-WebRequest -Uri $zipUrl -OutFile $outputFile

        # Unzip the archive
        Write-Host "Extracting archive..."
        Expand-Archive -Path $outputFile -DestinationPath . -Force

        # Clean up the downloaded zip file
        Remove-Item -Path $outputFile

        Write-Host "Update complete. The latest version of the '$selectedBranch' branch has been downloaded."
    } else {
        Write-Host "Invalid selection. Please run the script again and enter a valid number."
    }
}
catch {
    Write-Host "An error occurred: $_"
}

Read-Host -Prompt "Press Enter to exit"
