 #/
 # Stean Install Bash.
 #
 # @copyright 2024-present Inrae
 # @author mario.adam@inrae.fr
 # version 0.9
 #
 #/

clear

# Check if the script is run as root
# if [ "$EUID" -ne 0 ]; then
#   echo "Please run this script as root or use sudo"
#   exit 1
# fi

# Prompt for the domain name and directory
read -p "Enter the path to install api (/var/www/stean): " APIDEST
# Name of the file downladed
FILEDIST=./dist.zip
# Name of the backup
FILEDISTOLD=./distOld.zip
# Name of the run script
FILERUN=./run.sh

# Create run script
create_run() {
    if [ -f $FILERUN ]; then
        rm $FILERUN
        echo "Delete => $FILERUN"
    fi
    echo "#!/bin/bash" > $FILERUN
    echo "pm2 stop index" >> $FILERUN
    echo "pm2 flush" >> $FILERUN
    echo "pm2 delete index" >> $FILERUN
    echo "echo \"API starting ...\"" >> $FILERUN
    echo "NODE_ENV=production" >> $FILERUN
    echo "mv $APIDEST/api/logs.html $APIDEST/logs.bak" >> $FILERUN
    echo "pm2 start $APIDEST/api/index.js" >> $FILERUN
    echo "pm2 logs --lines 500" >> $FILERUN
    sudo chmod -R 777 $FILERUN
    echo "Create script => $FILERUN"
}

# Function to show logo
logo() {
    echo ""
    echo "  ____ __________    _     _   _ "
    echo " / ___|_ __  ____|  / \   | \ | |"
    echo " \___ \| | |  _|   / _ \  |  \| |"
    echo "  ___) | | | |___ / ___ \ | |\  |"
    echo " |____/|_| |_____|_/   \_\|_| \_|"
    echo ""
}

# Function to check Node and install it if not
check_node() {
    if ! command -v node > /dev/null
    then
        echo "Installing Node..."
        sudo apt install nodejs
    else
        echo "Node is already installed."
    fi    
}

# Function to check PostgreSQL-postgis and install it if not
check_pg() {
    if ! command -v psql --version > /dev/null
    then
        echo "Installing postgresql-postgis ..."
        sudo apt install postgis postgresql-14-postgis-3 -y
        if ! command -v psql --version > /dev/null
        then
            exit
        fi
    else
        echo "PostgreSQL is already installed."
    fi    
}

# Function to check pm2 and install it if not
check_pm2() {
    if ! command -v pm2 > /dev/null
    then
        echo "Installing pm2..."
        sudo npm install pm2@latest -g
    else
        echo "pm2 is already installed."
    fi    
}

# Function to check unzip and install it if not
check_unzip() {
    if ! command -v unzip > /dev/null
    then
        echo "Installing unzip..."
        sudo apt-get install unzip
    else
        echo "unzip is already installed."
    fi
}

# Function to check dist file
check_dist() {
    # Check if file already present and ask to use it if true
    if [ -f $FILEDIST ];
    then
        echo "$FILEDIST is already present."
        while true; do
            read -p "Do you wish to use it " yn
            case $yn in
                [Yy]* ) break;;
                [Nn]* ) download_dist; break;;
                * ) echo "Please answer yes or no.";;
            esac
        done
    else
        download_dist
    fi
}

# Function to make bak 
save_dist() {
    if [ -f "$FILEDIST" ]; then
        rm -f $FILEDISTOLD
        echo "Delete => $FILEDISTOLD"
        mv $FILEDIST $FILEDISTOLD
        echo "Move $FILEDIST => $FILEDISTOLD"
    fi
}

# Function to get stean
download_dist() {
    save_dist
    sudo curl -o $FILEDIST -L https://github.com/Mario-35/STEAN/raw/main/dist.zip
    echo "Downloading => $FILEDIST"
}

# Function to install stean
install_stean() {
    # remove bak
    if [ -f $APIDEST/apiBak ]; then
        rm -r $APIDEST/apiBak
        echo "Delete => $APIDEST/apiBak"
    fi
    # save actual to bak
    if [ -f $APIDEST/api ]; then
        mv $APIDEST/api $APIDEST/apiBak
        echo "Move $APIDEST/api => $APIDEST/apiBak"
    fi
    # create path
    sudo mkdir -p -m 777 $APIDEST/api
    echo "Create folder => $APIDEST/api"
    # unzip actual
    unzip -qq $FILEDIST -d $APIDEST/api/  
    echo "unzip $FILEDIST => $APIDEST/api"
    # Save config
    if [ -f $APIDEST/apiBak/configuration/configuration.json ]; then
        cp $APIDEST/apiBak/configuration/configuration.json $APIDEST/api/configuration/configuration.json
        echo "Move $APIDEST/apiBak/configuration/configuration.json => $APIDEST/api/configuration/configuration.json"
    fi
    # Save key
    if [ -f $APIDEST/apiBak/configuration/.key ]; then
        cp $APIDEST/apiBak/configuration/.key $APIDEST/api/configuration/.key
        echo "Move $APIDEST/apiBak/configuration/.key => $APIDEST/api/configuration/.key"        
    fi
    save_dist
    cd $APIDEST/api
    npm install --silent --omit=dev --prefix $APIDEST/api/
}

# Function to stop stean
stop_stean() {
    pm2 stop index
    pm2 kill
}

echo "------------------------------------------------------------------"
echo "|                         STEAN Install                          |"
echo "------------------------------------------------------------------"
check_pg
check_node
check_pm2
check_unzip
check_dist
stop_stean
install_stean
create_run
logo
