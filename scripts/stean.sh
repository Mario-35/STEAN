 #/
 # Stean Bash.
 #
 # @copyright 2024-present Inrae
 # @author mario.adam@inrae.fr
 # version 1.1
 #
 #/

clear

# Name of dtas
CONF=.steanpath
# Name of the file downladed
FILEDIST=./dist.zip
# Name of the backup
FILEDISTOLD=./distOld.zip 
# Name of the run script
FILERUN=./run.sh
# Name of the run script
SQLSCRIPT=./script.sql

# load configuration
if [ -f $CONF ]; then
    read APIDEST < $CONF
    APIDEST=$(echo "$APIDEST" | sed 's:/*$::')
fi

# Del configuration file if blank
if [ -z "${APIDEST}" ]; then
    if [ -f $CONF ]; then
        rm .steanpath
        echo "Delete => .steanpath cause is blank"
    fi
fi

# Stean version
if [ -f $APIDEST/api/package.json ]; then
    STEANVER=$(cat $APIDEST/api/package.json \
    | grep version \
    | head -1 \
    | awk -F: '{ print $2 }' \
    | sed 's/[",]//g')
fi

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
    echo "export NODE_ENV=production" >> $FILERUN
    echo "mv $APIDEST/api/logs.html $APIDEST/logs.bak" >> $FILERUN
    echo "pm2 start $APIDEST/api/index.js" >> $FILERUN
    echo "pm2 logs --lines 500" >> $FILERUN
    sudo chmod -R 777 $FILERUN
    echo "Create script => $FILERUN"
}

# Function to show logo
logo() {
    echo ""
    echo -e "\e[32m  ____ __________    _     _   _ \e[0m"
    echo -e "\e[32m / ___|_ __  ____|  / \   | \ | |\e[0m"
    echo -e "\e[32m \___ \| | |  _|   / _ \  |  \| |\e[0m"
    echo -e "\e[32m  ___) | | | |___ / ___ \ | |\  |\e[0m"
    echo -e "\e[32m |____/|_| |_____|_/   \_\|_| \_|   \e[34m$STEANVER\e[0m"
    echo ""
}

# Function to check Node and install it if not
check_node() {
    if ! command -v node > /dev/null
    then
        echo "Installing Node..."
        sudo apt install nodejs
        NODEVER=$(node -v) 
    else
        NODEVER=$(node -v) 
    fi    
}

# Function to check PostgreSQL-postgis and install it if not
check_pg() {
    if ! psql --version | grep -q "psql (PostgreSQL)"; then
        echo "Installing postgresql-postgis ..."
        sudo apt install postgis postgresql-14-postgis-3 -y
            if ! psql --version | grep -q "psql (PostgreSQL)"; then
            exit
        fi
        sudo -i -u postgres psql -c "ALTER USER postgres WITH PASSWORD 'postgres';"    
        sudo -i -u postgres psql -c "CREATE USER stean WITH PASSWORD 'stean';"    
        update_pg_hba
        PGVER=$(psql --version)
    else
        PGVER=$(psql --version)
    fi    
}

# Function to create PostgreSQL default postcres user
update_pg_hba() {
    SQLPATH=/etc/postgresql/14/main/pg_hba.conf
    sudo cp $SQLPATH $SQLPATH.bak
    if [ -f $SQLSCRIPT ]; then
        echo "rm $SQLSCRIPT"
        rm $SQLSCRIPT
        echo "Delete => $SQLSCRIPT"
    fi
    echo "create table hba ( lines text );" > $SQLSCRIPT
    echo "hba from ($SQLPATH);" >> $SQLSCRIPT
    echo "insert into hba (lines) values ('host    all             all             0.0.0.0/0            md5');" >> $SQLSCRIPT
    echo "insert into hba (lines) values ('listen_addresses = ''*''');" >> $SQLSCRIPT
    echo "copy hba to '$SQLPATH';" >> $SQLSCRIPT
    echo "select pg_reload_conf();" >> $SQLSCRIPT
    sudo psql -U postgres -f $SQLSCRIPT
    rm $SQLSCRIP
}

# Function to check pm2 and install it if not
check_pm2() {
    if ! command -v pm2 > /dev/null
    then
        echo "Installing pm2..."
        sudo npm install pm2@latest -g
        PM2VER=$(pm2 -v) 
    else
        PM2VER=$(pm2 -v) 
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
    if [ -f $FILEDIST ]; then
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
    unzip -qq -o $FILEDIST -d $APIDEST/api/  
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
    npm install --silent --omit=dev --prefix $APIDEST/api/
}

# Function to stop stean
stop_stean() {
    echo "API Stopping ..."
    pm2 stop index
    pm2 kill
}

# Function to run stean
run_stean() {
    echo "API starting ..."
    NODE_ENV=production
    mv $APIDEST/api/logs.html $APIDEST/logs.bak
    pm2 start $APIDEST/api/index.js
}

# Function to show menu
menu() {
    logo
    if command -v pm2 > /dev/null
    then
        pm2 ls
    fi
    echo -e "\e[34mStean : \e[32m$STEANVER \e[34mNode : \e[32m$NODEVER \e[34mPostgreSQL : \e[32m$PGVER \e[34mPm2: \e[32m$PM2VER \e[0m"
    echo -e "\e[34mStean path : \e[32m$APIDEST\e[0m"
    echo -e "\e[33m---------------- MENU ----------------\e[0m"
    for index in "${!options[@]}"; do
        echo "$((index+1))) ${options[index]}"
    done

}

# Function to reload script menu
restart() {
    bash ./stean.sh && exit
}

check_node
check_pg
check_pm2
menu
PS3='Please enter your choice : '
if [ -f $APIDEST/api/index.js ]; then
    options=("Change path" "Update stean" "Back to previous" "Create run script" "Run stean" "Stop stean" "Logs" "Reload" "Quit")
else
    if [ -f .steanpath ]; then
        options=("Change path" "Install all" "Reload" "Quit")
    else
        echo -e "\e[31mNo path you have to indicate the path\e[0m"
        options=("Indicate path" "Reload" "Quit")
    fi
fi
select opt in "${options[@]}"
do
    case $opt in
        "Indicate path")
            # Prompt for the domain name and directory
            read -p "Enter the path to install api (/var/www/stean) [./]: " APIDEST
            echo $APIDEST > .steanpath
            restart
            break
            ;;
        "Change path")
            # Prompt for the domain name and directory
            read -p "Enter the new path to install api (/var/www/stean) [./]: " APIDEST
            echo $APIDEST > .steanpath
            restart
            break
            ;;
        "Install all")
            echo "┌───────────────────────────────────────────────────────────────┐"
            echo "│                         STEAN Install                         │"
            echo "└───────────────────────────────────────────────────────────────┘"
            check_pg
            check_node
            check_pm2
            check_unzip
            check_dist
            stop_stean
            install_stean
            restart
            break
            ;;
        "Update stean")
            echo "┌───────────────────────────────────────────────────────────────┐"
            echo "│                         STEAN Update                          │"
            echo "└───────────────────────────────────────────────────────────────┘"
            check_dist
            stop_stean
            install_stean
            restart
            break
            ;;
        "Back to previous")
            echo "┌───────────────────────────────────────────────────────────────┐"
            echo "│                         STEAN Go Back                         │"
            echo "└───────────────────────────────────────────────────────────────┘"        
            stop_stean
            rm -r $APIDEST/api
            mv $APIDEST/apiBak $APIDEST/api
            restart
            break
            ;;
        "Create run script")
            echo "┌───────────────────────────────────────────────────────────────┐"
            echo "│                       Create Run script                       │"
            echo "└───────────────────────────────────────────────────────────────┘"         
            create_run
            echo "script ====> ./run.sh"            
            ;;
        "Run stean")
            echo "┌───────────────────────────────────────────────────────────────┐"
            echo "│                           STEAN Run                           │"
            echo "└───────────────────────────────────────────────────────────────┘"
            stop_stean            
            run_stean
            restart
            break
            ;;
        "Stop stean")
            echo "┌───────────────────────────────────────────────────────────────┐"
            echo "│                           STEAN Stop                          │"
            echo "└───────────────────────────────────────────────────────────────┘"
            stop_stean
            restart
            break
            ;;
        "Reload")
            restart
            break
            ;;
        "Logs")
            pm2 logs --lines 500
            break
            ;;
        "Quit")
            break
            ;;
        *) echo "invalid option $REPLY";;
    esac
done

