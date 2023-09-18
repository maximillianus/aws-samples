#!/bin/bash

# This is tested on Ubuntu

# Create user mimir
sudo useradd --no-create-home --shell /bin/false mimir

# Create directories for mimir's data and config
sudo mkdir -p /etc/mimir/
sudo mkdir -p /var/lib/mimir

# Copy files to corresponding dir
sudo cp mimir-dir/mimir /usr/local/bin/
sudo cp mimir-dir/config.yaml /etc/mimir/
sudo cp mimir-dir/metrics-activity.log /var/lib/mimir/

# Modify ownership
sudo chown mimir:mimir /usr/local/bin/mimir
sudo chown -R mimir:mimir /etc/mimir/
sudo chown -R mimir:mimir /var/lib/mimir


sudo cat << EOF | sudo tee /etc/systemd/system/mimir.service
[Unit]
Description=Grafana mimir is horizontally scalable, highly available, multi-tenant, long term Prometheus storage
Documentation=https://grafana.com/oss/mimir/
Wants=network-online.target
After=network-online.target

[Service]
User=mimir
Group=mimir
Type=simple
ExecStart=/usr/local/bin/mimir \
    --config.file /etc/mimir/demo.yml \
    --activity-tracker.filepath /var/lib/mimir/metrics-activity.log \
    --ruler.rule-path /var/lib/mimir/data-ruler/

[Install]
WantedBy=multi-user.target
EOF