# Deploy Nodeapp

```

gcloud container clusters create nodeapp-cluster \
    --project=wideops-candidate6 \
    --zone=us-central1-c

docker build -t gcr.io/wideops-candidate6/omar-nodeapp:test .

docker push gcr.io/wideops-candidate6/omar-nodeapp:test

gcloud container clusters get-credentials "nodeapp-cluster" \
            --project "wideops-candidate6" \
            --zone "us-central1-c" 


kubectl apply -f deployment.yaml

kubectl autoscale deployment omar-nodeapp --cpu-percent=50 --min=2 --max=8 

kubectl get deployments
kubectl get pods
kubectl get services
kubectl get hpa


For auto versioning:
docker push gcr.io/wideops-candidate6/omar-nodeapp:${SHORT_SHA}
sed -i 's|gcr.io/devops-343007/omar-react-image:.*|gcr.io/devops-343007/omar-react-image:${SHORT_SHA}|' manifest.yml

```


# Deploy MongoDB:

```
sudo apt install dirmngr gnupg apt-transport-https software-properties-common ca-certificates curl lsof ufw

curl -fsSL https://www.mongodb.org/static/pgp/server-4.2.asc | sudo apt-key add -

sudo add-apt-repository 'deb https://repo.mongodb.org/apt/debian buster/mongodb-org/4.2 main'

sudo apt update

sudo apt install mongodb-org

sudo systemctl enable mongod --now

mongo --eval 'db.runCommand({ connectionStatus: 1 })'

sudo systemctl status mongod

```



# Firewall: 

Open ports to be able to access the DB
```
sudo lsof -i | grep mongo

sudo ufw enable

sudo ufw default allow outgoing
sudo ufw default deny incoming
sudo ufw allow ssh
sudo ufw allow 22/tcp
sudo ufw allow 2222/tcp
sudo ufw allow 27017

sudo ufw status

- Other Commands:
sudo ufw delete allow ssh
sudo ufw allow from Anywhere to any port 27017
```


# Config:

```
sudo nano /etc/mongod.conf
(add 0.0.0.0 to bindIp or bindIpAll: true)

sudo systemctl restart mongod
```


# ReplicaSet 

Adding DNS for IPs (Optional):

```
sudo nano /etc/hosts

203.0.113.0 mongo0.replset.member
203.0.113.1 mongo1.replset.member

sudo ufw allow from mongo1_server_ip to any port 27017
sudo ufw allow from mongo2_server_ip to any port 27017

sudo ufw allow from mongo0_server_ip to any port 27017
sudo ufw allow from mongo2_server_ip to any port 27017
```


Configuring replication:
```
sudo nano /etc/mongod.conf

network interfaces
net:
  port: 27017
  bindIp: 127.0.0.1,35.238.178.61
  bindIpAll: true
. . .
replication:
  replSetName: "rs0"

sudo systemctl restart mongod
```

## Starting replicaset in one machine


At mongo shell:

1- Initiate ReplicaSet:
```
rs.initiate(
... {
... _id: "rs0",
... members: [
... { _id: 0, host: "104.197.154.17" },
... { _id: 1, host: "35.238.178.61" }
... ]
... })
```

2- Activate Seconery DB by:
```
rs.secondaryOk()
```

```
- Other Commands:
rs.addArb(hostportstr)
rs.add("34.141.19.170")
rs.remove("mongo0master.replset.member:27017")
```


# Auth:

1- At mongo shell: 

```
use admin

db.createUser({
user: "admin",
pwd: "admin",
pwd: passwordPrompt(),
roles:[
"dbOwner", 
"userAdmin", 
"userAdminAnyDatabase",
"clusterAdmin",
"dbAdminAnyDatabase"
]
})
```

Other roles:
```
for super admin:
readWriteAnyDatabase
dbAdminAnyDatabase
userAdminAnyDatabase
clusterAdmin
dbOwner 
userAdmin
```

```


2- Enable auth in config

```
sudo nano /etc/mongod.conf
security:
  authorization: enabled

sudo systemctl restart mongod
sudo systemctl status mongod
```