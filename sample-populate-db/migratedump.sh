# Migrate from existing database to target database
# add command time in front to measure time
sudo mysqldump -u sourceusername \
    --databases testdb \
    --single-transaction \
    --compress \
    --order-by-primary  \
    --routines=0 \
    --triggers=0 \
    --events=0 \
    -pSourcePass | mysql -u targetusername \
        --port=3306 \
        --host=rds-host.someidentifier.ap-southeast-1.rds.amazonaws.com \
        -pTargetPass