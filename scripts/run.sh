pm2 stop index
pm2 flush
pm2 delete index
echo "$FILEAPP starting ..."
NODE_ENV=production
mv ./api/logs.txt ./logs.bak
pm2 start ./api/index.js
pm2 logs --lines 500