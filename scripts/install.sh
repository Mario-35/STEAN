#!/bin/bash
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
    npm install pm2@latest -g
}

# Function to get stean
download_stean() {
    echo "Downloading stean..."
    if [ -f "$FILEDIST" ]; then
        rm $FILEDISTOLD
        mv $FILEDIST $FILEDISTOLD
    fi
    curl -o $FILEDIST -L https://github.com/Mario-35/STEAN/raw/main/dist.zip
}

# Function to install Node
install_stean() {
    # Save config
    if [ -f "$FILECONFIG" ]; then
        echo "$FILECONFIG exists."
        config=$(<$FILECONFIG)
    else 
        echo "$FILECONFIG does not exist"
        echo -n "Postges host : "
        read -r host
        echo -n "Postges port : "
        read -r port
        echo -n "Postges user name : "
        read -r user
        echo -n "Postges password : "
        read -r password
        echo -n "Postges database : "
        read -r database
        config = "{
                    \"admin\": {
                        \"name\":\"admin\",
                        \"pg\":{
                            \"host\": \"$host\",
                            \"port\": $port,
                            \"user\": \"$user\",
                            \"password\": \"$password\",
                            \"database\": \"$database\",
                            \"retry\": 2 
                        }
                        \"logFile\": \"\",
                    }
                }"
    fi
    # Save key
    if [ -f "$FILEKEY" ]; then
        echo "$FILEKEY exists."
        key=$(<$FILEKEY)
    else 
        key= "zLwX893Mtt9Rc0TKvlInDXuZTFj9rxDV"
    fi
    stop_stean
    # remove bak
    rm -r $APIBak
    # save actual to bak
    mv $APIDEST $APIBak
    # unzip actual
    unzip $FILEDIST -d $APIDEST/  
    cd $APIDEST
    npm install --omit=dev
    # save key
    echo "$key" > $FILEKEY
    # save config
    echo "$config" > $FILECONFIG
}

stop_stean() {
    pm2 stop index
    pm2 kill
}

start_stean() {
    stop_stean
    if [ -f "$FILEAPP" ]; then      
        NODE_ENV=production pm2 start $FILEAPP
        pm2 logs --lines 500
    else 
        echo "$FILECONFIG does not exist can't launch app."
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

download_stean
install_stean
start_stean