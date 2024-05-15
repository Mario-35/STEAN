import requests
import json
import os

class instanceST():
    def __init__(self, urlServer, username, password):
        self.urlServer = urlServer
        self.username = username
        self.password = password
        self.token = ""
              
        
    def connexion(self):
        print("Connexion", self.username, " à ",self.urlServer)
        json_data = json.dumps({"username":self.username,"password":self.password})
        response = requests.post(url=self.urlServer + "login", headers= {'Content-Type': 'application/json'}, data=json_data)
        if response.status_code == 200:
            print("Connexion OK à ", self.urlServer,"\n") 
            self.token = response.json()["token"]

    def log_out(self):
        print("Déconnexion de ",self.urlServer)
        response = requests.get(url=self.urlServer + "logout")
        if response.status_code == 200:
            print("Déconnexion OK de ", self.urlServer,"\n")

    def getInfo(self, objet, options):
        url= "%s%s?$%s"% (self.urlServer, objet, options)
        print(url)
        response = requests.get(url=url)
        objet_json = response.json()['value']
        if len(objet_json) == 1:
            return objet_json
        else:
            if len(objet_json) > 1:
                print("Plusieurs objet trouvés selon le filtre -> ", options)
            else:
                print("Aucun objet trouvé selon le filtre -> ", options)
            return -1

    def postCsvFile(self, fileName, datas):
        files = {
            'json': (None, json.dumps(datas), 'application/json'),
            'file': (os.path.basename(fileName), open(fileName, 'rb'), 'application/octet-stream')
        }
        headers = { 'Authorization': "Bearer {}".format(self.token) }
        response = requests.post(self.urlServer + "CreateObservations", headers=headers, files=files)
        return response