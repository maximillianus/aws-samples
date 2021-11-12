import pandas as pd
from faker import Faker
from collections import defaultdict
from sqlalchemy import create_engine
import urllib.parse

fake = Faker()
fake_data = defaultdict(list)

for _ in range(10000):
    fake_data["first_name"].append( fake.first_name() )
    fake_data["last_name"].append( fake.last_name() )
    fake_data["occupation"].append( fake.job() )
    fake_data["dob"].append( fake.date_of_birth() )
    fake_data["country"].append( fake.country() )
    if _%5000 == 0:
        print(_)

df_fake_data = pd.DataFrame(fake_data)

password = urllib.parse.quote_plus("Root@123")  # '123%40456'
engine = create_engine(f'mysql://root:{password}@localhost/testdb', echo=False)

df_fake_data.to_sql('user', con=engine,index=False, if_exists='append')