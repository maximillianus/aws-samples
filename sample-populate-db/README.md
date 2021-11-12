# Populate DB

This is example of populating a MySQL DB with fake data using python

## Installing MySQL on Amazon Linux 2
```
sudo yum update -y
# install mysql 8
sudo yum install https://dev.mysql.com/get/mysql80-community-release-el7-3.noarch.rpm -y
sudo amazon-linux-extras install epel -y
sudo yum install mysql-community-server -y
sudo systemctl enable --now mysqld
sudo grep 'temporary password' /var/log/mysqld.log
sudo mysql_secure_installation -p'temporary password'
sudo systemctl restart mysqld
sudo yum install -y gcc mysql-devel
sudo yum install -y python3-devel

```

## Install Python and create test db
```
pip3 install pandas Faker sqlalchemy mysqlclient
mysql -u root -p < create-db.sql
```

## Run script with timer
```
time python3 script.py
```

