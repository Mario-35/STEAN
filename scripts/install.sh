 #/
 # Stean Install Bash.
 #
 # @copyright 2024-present Inrae
 # @author mario.adam@inrae.fr
 # version 0.5
 #
 #/

clear
APIDEST=/opt/stean/api
APIBak=apiBak
FILEAPP=./$APIDEST/index.js
FILEDIST=./dist.zip
FILEDISTOLD=./distOld.zip
FILEKEY=./$APIDEST/configuration/.key
FILECONFIG=./$APIDEST/configuration/configuration.json
HELLOSCRIPT=./hello.sql

# Script to install Node.js using Node on Ubuntu without sudo

logo() {
    echo "  ____ __________    _     _   _ "
    echo " / ___|_ __  ____|  / \   | \ | |"
    echo " \___ \| | |  _|   / _ \  |  \| |"
    echo "  ___) | | | |___ / ___ \ | |\  |"
    echo " |____/|_| |_____|_/   \_\|_| \_|"
}
# Function to install Node
install_node() {
    echo "Installing Node..."
    sudo apt install nodejs
}

# Function to install postgresql-postgis
install_pg() {
    echo "Installing postgresql-postgis ..."
    sudo apt autoremove
    sudo apt install postgis postgresql-14-postgis-3 -y -qq
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

save_dist() {
    if [ -f "$FILEDIST" ]; then
        rm $FILEDISTOLD
        mv $FILEDIST $FILEDISTOLD
    fi
}

# Function to get stean
download_stean() {
    echo "Downloading stean..."
    save_dist
    sudo curl -o $FILEDIST -L https://github.com/Mario-35/STEAN/raw/main/dist.zip
    sudo curl -o $HELLOSCRIPT -L https://github.com/Mario-35/STEAN/raw/main/scripts/hello.sql
}

# Function to create run.sh
create_run() {
    echo "Create run.sh"
    cp ./$APIDEST/scripts/run.sh .
    sudo chmod -R 777 run.sh
    cp ./$APIDEST/scripts/back.sh .
    sudo chmod -R 777 back.sh
}

# Function to install stean
install_stean() {
    stop_stean
    # remove bak
    rm -r $APIBak
    # save actual to bak
    mv $APIDEST $APIBak
    # unzip actual
    unzip -qq $FILEDIST -d $APIDEST/  
    # Save config
    if [ -f ./$APIBak/configuration/configuration.json ]; then
        echo "confifuration exist."
        cp ./$APIBak/configuration/configuration.json ./$APIDEST/configuration/configuration.json
    fi
    # Save key
    if [ -f ./$APIBak/configuration/.key ]; then
        echo "Key exists."
        cp ./$APIBak/configuration/.key ./$APIDEST/configuration/.key
    fi
    save_dist
    create_run
    cd $APIDEST
    npm install --silent --omit=dev
    cd ..
}

stop_stean() {
    pm2 stop index
    pm2 kill
}

#------------------------------------------------------------------
#|                        START                                   |
#------------------------------------------------------------------
echo "---------- Installation ---------"
logo
# Check if PostgreSQL  is installed
if ! command -v psql --version &> /dev/null
then
    echo "PostgreSQL is Not installed."
    install_pg
    if ! command -v psql --version &> /dev/null
    then
        exit
    fi
else
    echo "PostgreSQL is installed."
fi


# Check if Node is installed
if ! command -v node &> /dev/null
then
    install_node
else
    echo "Node is already installed."
fi

# Check if pm2 is installed
if ! command -v pm2 &> /dev/null
then
    install_pm2
else
    echo "pm2 is already installed."
fi

# Check if unzip is installed
if ! command -v unzip &> /dev/null
then
    install_unzip
else
    echo "unzip is already installed."
fi


if [ -f $FILEDIST ];
then
    echo "$FILEDIST is already present."
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

psql -U postgres -f $HELLOSCRIPT

install_stean
sh ./run.sh
install_stean
echo "------------ Installed ----------"
logo

sudo rm install.sh | sudo curl -fsSL https://raw.githubusercontent.com/Mario-35/STEAN/main/scripts/install.sh -o install.sh | sudo less install.sh | sudo chmod +x install.sh | run ./install.sh
