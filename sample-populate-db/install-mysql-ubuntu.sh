#!/bin/bash

sudo apt update -y
sudo apt install -y mysql-server
sudo systemctl start mysql.service