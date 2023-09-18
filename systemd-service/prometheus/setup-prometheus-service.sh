#!/bin/bash

# This is tested on Ubuntu

# Create user mimir
sudo useradd --no-create-home --shell /bin/false prometheus

# Create directories for mimir's data and config
sudo mkdir -p /etc/prometheus/
sudo mkdir -p /var/lib/prometheus

# Copy files to corresponding dir
sudo cp prometheus-dir/prometheus /usr/local/bin/
sudo cp prometheus-dir/promtool /usr/local/bin/
sudo cp -r prometheus-files/consoles /etc/prometheus
sudo cp -r prometheus-files/console_libraries /etc/prometheus


# Modify ownership
sudo chown prometheus:prometheus /usr/local/bin/prometheus
sudo chown prometheus:prometheus /usr/local/bin/promtool
sudo chown -R prometheus:prometheus /etc/prometheus
sudo chown -R prometheus:prometheus /var/lib/prometheus
sudo chown -R prometheus:prometheus /etc/prometheus/consoles
sudo chown -R prometheus:prometheus /etc/prometheus/console_libraries

# Create config file
cat << EOF | sudo tee /etc/prometheus/prometheus.yaml
global:
  scrape_interval: 10s

scrape_configs:
  - job_name: "prometheus"
    scrape_interval: 5s
    static_configs:
      - targets: ["localhost:9090"]
EOF

# Create unit file
sudo cat << EOF | sudo tee /etc/systemd/system/mimir.service
[Unit]
Description=Prometheus is system monitoring and alerting tools
Documentation=https://grafana.com/oss/prometheus/
Wants=network-online.target
After=network-online.target

[Service]
User=prometheus
Group=prometheus
Type=simple
ExecStart=/usr/local/bin/prometheus \
    --config.file /etc/prometheus/prometheus.yml \
    --storage.tsdb.path /var/lib/prometheus/ \
    --web.console.templates=/etc/prometheus/consoles \
    --web.console.libraries=/etc/prometheus/console_libraries

[Install]
WantedBy=multi-user.target
EOF