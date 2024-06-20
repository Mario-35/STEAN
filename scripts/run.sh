pm2 stop index
pm2 flush index
pm2 delete index
echo "$FILEAPP starting ..."
NODE_ENV=production 
pm2 start ./api/index.js --output ./api/logs.txt
pm2 logs --lines 500