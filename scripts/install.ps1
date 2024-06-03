 #/
 # Stean Install PowerShell.
 #
 # @copyright 2024-present Inrae
 # @author mario.adam@inrae.fr
 # version 0.2
 #
 #/

$APIDEST = "api" # api folder name
$APIBak = "apiBak" # api saved folder name
$POSTGRES = "C:\Program Files\PostgreSQL" # postgres windows install path
$NODEJS = "C:\Program Files\nodejs" # nodeJS windows install path
$FILEAPP = ".\$APIDEST\index.js" # app path
$FILEDIST = ".\dist.zip" # name ditrib file path
$FILEDISTOLD = ".\distBak.zip" # name saved ditrib file

Write-Host "Installing Stean..."

# Function to install Node
function install_node {
    Write-Host "Installing Node..."
    choco install nodejs
}

# Function to save ditrib
function save_dist {
    if (Test-Path $FILEDIST) {
        if (Test-Path $FILEDISTOLD) {
            Remove-Item $FILEDISTOLD -Force
        }
        Move-Item $FILEDIST $FILEDISTOLD
    }
}

# Function to download stean ditrib
function download_stean {
    Write-Host "Downloading stean ..."
    save_dist
    Invoke-WebRequest -Uri "https://github.com/Mario-35/STEAN/raw/main/dist.zip" -OutFile $FILEDIST
}


# Function to install stean
function install_stean {
    Write-Host "Start Install."
    # remove bak
    if (Test-Path .\$APIBak) {
        Write-Host "$APIBak exists."
        Remove-Item .\$APIBak -Recurse -Force
    } else {
        Write-Host "$APIBak Not exists."
    }
    # save actual to bak
    if (Test-Path .\$APIDEST) {
        Write-Host "$APIDEST exists."     	
        Rename-Item -Path .\$APIDEST -NewName .\$APIBak
    }
    # unzip actual
    # Expand-Archive -Path $FILEDIST -DestinationPath $APIDEST
    Add-Type -AssemblyName System.IO.Compression.FileSystem
    [System.IO.Compression.ZipFile]::ExtractToDirectory($FILEDIST, $APIDEST)
    # Save config
    if (Test-Path .\$APIBak\configuration\production.json) {
        Write-Host "configuration exists."
        Copy-Item .\$APIBak\configuration\production.json .\$APIDEST\configuration\production.json
    }
    # Save key
    if (Test-Path .\$APIBak\configuration\.key) {
        Write-Host "Key exists."
        Copy-Item .\$APIBak\configuration\.key .\$APIDEST\configuration\.key
    }
    save_dist
    Set-Location $APIDEST
    npm install --omit=dev
    npm install -g nodemon
    Set-Location ..
}

# Function to stop stean if running
function stop_stean {
    Write-Host "node stop"
}

# Function to run stean
function start_stean {
    stop_stean
    if (Test-Path $FILEAPP) {
        Write-Host "$FILEAPP starting ..."
        $env:NODE_ENV = "production"
        nodemon -x "node $FILEAPP || copy /b $FILEAPP +,,"
    } else {
        Write-Host "$FILEAPP does not exist, can't launch app."
    }
}

#------------------------------------------------------------------
#|                        START                                   |
#------------------------------------------------------------------

# Check if PostgreSQL is installed
if (Test-Path $POSTGRES) {
    $latest = Get-ChildItem -Path $POSTGRES | Sort-Object LastAccessTime -Descending | Select-Object -First 1
    if (-not ([string]::IsNullOrEmpty($latest))) {
        Write-Host "PostgreSQL is installed. ($latest)"
    } else {
        Write-Host "PostgreSQL is Not installed."
        exit
    }

    # Check if Postgis is installed
    if (Test-Path $latest"\share\contrib") {
        $filter = "postgis*"
        $first = Get-ChildItem -Path $latest"\share\contrib" -Filter $filter | Sort-Object LastAccessTime -Descending | Select-Object -First 1
        if (-not ([string]::IsNullOrEmpty($first)))
        {
            Write-Host "Postgis installed. ($first)"
        } else {
            Write-Host "Postgis is Not installed."
            exit
        }
    } else {
        Write-Host "Postgis is Not installed."
        exit
    }

} else {
    Write-Host "PostgreSQL is Not installed."
    exit
}

# Check if Node is installed
if (Test-Path $NODEJS) {
    Write-Host "Node is already installed."
} else {
    Write-Host "Node is Not installed."
    install_node
    exit
}

# Check if distrib is present IT use if a distrib is manualy put istead of download from repo
if (Test-Path $FILEDIST) {
    Write-Host "$FILEDIST is already present."
    while ($true) {
        $yn = Read-Host "Do you wish to use it (Y/N)"
        switch -Regex ($yn) {
            "^[Yy]" { break }
            "^[Nn]" { download_stean; break }
            default { Write-Host "Please answer yes or no." }
        }
    }
} else {
    download_stean
}

install_stean
start_stean
