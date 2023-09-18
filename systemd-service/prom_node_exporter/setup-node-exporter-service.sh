#!/bin/bash

# This is tested on Ubuntu

# Create user mimir
sudo useradd --no-create-home --shell /bin/false node_exporter

# Copy files to corresponding dir
sudo cp node-exporter-dir/node_exporter /usr/local/bin/

# Modify ownership
sudo chown node_exporter:node_exporter /usr/local/bin/node_exporter


sudo cat << EOF | sudo tee /etc/systemd/system/node_exporter.service
[Unit]
Description=Node Exporter
Documentation=https://prometheus.io/docs/guides/node-exporter/
Wants=network-online.target
After=network-online.target

[Service]
User=node_exporter
Group=node_exporter
Type=simple
ExecStart=/usr/local/bin/node_exporter

[Install]
WantedBy=multi-user.target
EOF