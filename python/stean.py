import requests
import json
import os

class instanceST():
    def __init__(self, urlServer):
        self.token = None
        self.urlServer = urlServer     
        self.session = None     
        
    def connexion(self, username, password):
        print("Connexion", username, "à ",self.urlServer)
        req = requests.post(url=self.urlServer + "login", headers= {'Content-Type': 'application/json'}, data=json.dumps({"username":username,"password": password}))
        if req.status_code == 200:
            print("Connexion OK à ", self.urlServer,"\n") 
            self.token = req.json()['token']
            self.session = requests.session()

    def log_out(self):
        print("Déconnexion de ",self.urlServer)
        req = self.session.get(url=self.urlServer + "logout")
        if req.status_code == 200:
            print("Déconnexion OK de ", self.urlServer,"\n")
            self.token = None
            self.session = None

    def getInfo(self, objet, options):
        url = "%s%s?$%s"% (self.urlServer, objet, options)
        print(url)
        req = self.session.get(url=url)
        objet_json = req.json()['value']
        if len(objet_json) == 1:
            return objet_json
        else:
            if len(objet_json) > 1:
                print("Plusieurs objets trouvé selon le filtre ->",options)
            else:
                print("Aucun objet trouvé selon le filtre ->",options)
            return -1

    def postCsvFile(self, fileName, datas):
        files = {
            'json': (None, json.dumps(datas), 'application/json'),
            'file': (os.path.basename(fileName), open(fileName, 'rb'), 'application/octet-stream')
        }
        headers = { 'Authorization': "Bearer {}".format(self.token) }
        return self.session.post(self.urlServer + "CreateObservations", headers=headers, files=files)