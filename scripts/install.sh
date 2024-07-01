file_dist_old #/
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
read -p "Enter the path to install api (/var/www/stean): " api_dest
file_dist=./dist.zip
file_dist_old=./distOld.zip
script_run=./run.sh

create_run() {
    if [ -f $script_run ];
    then
        rm $script_run
        echo "Delete => $script_run"
    fi
    echo "#!/bin/bash" > $script_run
    echo "pm2 stop index" >> $script_run
    echo "pm2 flush" >> $script_run
    echo "pm2 delete index" >> $script_run
    echo "echo \"API starting ...\"" >> $script_run
    echo "NODE_ENV=production" >> $script_run
    echo "mv $api_dest/api/logs.html $api_dest/logs.bak" >> $script_run
    echo "pm2 start $api_dest/api/index.js" >> $script_run
    echo "pm2 logs --lines 500" >> $script_run
    sudo chmod -R 777 $script_run
    echo "Create script => $script_run"
}

# Script to install Node.js using Node on Ubuntu without sudo
logo() {
    echo ""
    echo "  ____ __________    _     _   _ "
    echo " / ___|_ __  ____|  / \   | \ | |"
    echo " \___ \| | |  _|   / _ \  |  \| |"
    echo "  ___) | | | |___ / ___ \ | |\  |"
    echo " |____/|_| |_____|_/   \_\|_| \_|"
    echo ""
}

# Function to install Node
install_node() {
    echo "Installing Node..."
    sudo apt install nodejs
}

# Function to install postgresql-postgis
install_pg() {
    echo "Installing postgresql-postgis ..."
    sudo apt install postgis postgresql-14-postgis-3 -y
}

# Function to install pm2
install_pm2() {
    echo "Installing pm2..."
    sudo npm install pm2@latest -g
}

# Function to install unzip
install_unzip() {
    echo "Installing unzip..."
    sudo apt-get install unzip
}

# Function to make bak 
save_dist() {
    if [ -f "$file_dist" ]; then
        rm -f $file_dist_old
        echo "Delete => $file_dist_old"
        mv $file_dist $file_dist_old
        echo "Move $file_dist => $file_dist_old"
    fi
}

# Function to get stean
download_stean() {
    save_dist
    sudo curl -o $file_dist -L https://github.com/Mario-35/STEAN/raw/main/dist.zip
    echo "Downloading => $file_dist"
}

# Function to install stean
install_stean() {
    stop_stean
    # remove bak
    if [ -f $api_dest/apiBak ];
    then
        rm -r $api_dest/apiBak
        echo "Delete => $api_dest/apiBak"
    fi
    # save actual to bak
    if [ -f $api_dest/api ];
    then
        mv $api_dest/api $api_dest/apiBak
        echo "Move $api_dest/api => $api_dest/apiBak"
    fi
    # create path
    sudo mkdir -p -m 777 $api_dest/api
    echo "Create folder => $api_dest/api"
    # unzip actual
    unzip -qq $file_dist -d $api_dest/api/  
    echo "unzip $file_dist => $api_dest/api"
    # Save config
    if [ -f $api_dest/apiBak/configuration/configuration.json ]; then
        cp $api_dest/apiBak/configuration/configuration.json $api_dest/api/configuration/configuration.json
        echo "Move $api_dest/apiBak/configuration/configuration.json => $api_dest/api/configuration/configuration.json"
    fi
    # Save key
    if [ -f $api_dest/apiBak/configuration/.key ]; then
        cp $api_dest/apiBak/configuration/.key $api_dest/api/configuration/.key
        echo "Move $api_dest/apiBak/configuration/.key => $api_dest/api/configuration/.key"        
    fi
    save_dist
    npm install --silent --omit=dev --prefix $api_dest/api/
}

stop_stean() {
    pm2 stop index
    pm2 kill
}

#------------------------------------------------------------------
#|                        START                                   |
#------------------------------------------------------------------
echo "---------- Installation ---------"
# Check if PostgreSQL  is installed
if ! command -v psql --version > /dev/null
then
    echo "PostgreSQL is Not installed."
    install_pg
    if ! command -v psql --version > /dev/null
    then
        exit
    fi
else
    echo "PostgreSQL is installed."
fi

# Check if Node is installed
if ! command -v node > /dev/null
then
    install_node
else
    echo "Node is already installed."
fi

# Check if pm2 is installed
if ! command -v pm2 > /dev/null
then
    install_pm2
else
    echo "pm2 is already installed."
fi

# Check if unzip is installed
if ! command -v unzip > /dev/null
then
    install_unzip
else
    echo "unzip is already installed."
fi

if [ -f $file_dist ];
then
    echo "$file_dist is already present."
    while true; do
        read -p "Do you wish to use it " yn
        case $yn in
            [Yy]* ) break;;
            [Nn]* ) download_stean; break;;
            * ) echo "Please answer yes or no.";;
        esac
    done
else
    download_stean
fi

install_stean
create_run
logo
