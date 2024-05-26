 #/
 # Stean Install Bash.
 #
 # @copyright 2024-present Inrae
 # @author mario.adam@inrae.fr
 # version 0.1
 #
 #/

clear
APIDEST=api
APIBak=apiBak
FILEAPP=./$APIDEST/index.js
FILEDIST=./dist.zip
FILEDISTOLD=./distOld.zip
FILEKEY=./$APIDEST/configuration/.key
FILECONFIG=./$APIDEST/configuration/production.json

# Script to install Node.js using Node on Ubuntu without sudo

echo "Installing Stean..."

# Function to install Node
install_node() {
    echo "Installing Node..."
    sudo apt install nodejs
}

# Function to install Node
install_pm2() {
    echo "Installing pm2..."
    sudo npm install pm2@latest -g
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
    curl -o $FILEDIST -L https://github.com/Mario-35/STEAN/raw/main/dist.zip
}

# Function to install Node
install_stean() {
    stop_stean
    # remove bak
    rm -r $APIBak
    # save actual to bak
    mv $APIDEST $APIBak
    # unzip actual
    unzip $FILEDIST -d $APIDEST/  
    # Save config
    if [ -f ./$APIBak/configuration/production.json ]; then
        echo "confifuration exist."
        cp ./$APIBak/configuration/production.json ./$APIDEST/configuration/production.json
    fi
    # Save key
    if [ -f ./$APIBak/configuration/.key ]; then
        echo "Key exists."
        cp ./$APIBak/configuration/.key ./$APIDEST/configuration/.key
    fi
    save_dist
    cd $APIDEST
    npm install --omit=dev
    cd ..
}

stop_stean() {
    pm2 stop index
    pm2 kill
}

start_stean() {
    stop_stean
    if [ -f "$FILEAPP" ]; then      
        echo "$FILEAPP starting ..."
        NODE_ENV=production pm2 start $FILEAPP
    else 
        echo "$FILEAPP does not exist can't launch app."
    fi
}

#------------------------------------------------------------------
#|                        START                                   |
#------------------------------------------------------------------

# Check if PostgreSQL  is installed
if ! command -v psql --version &> /dev/null
then
    echo "PostgreSQL is Not installed."
    exit
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

install_stean
start_stean
