from supabase import create_client, Client
from dotenv import load_dotenv
import os

load_dotenv()

# supabase url and api key
url = os.getenv("SUPABASE_URL")
key = os.getenv("SUPABASE_KEY")

supabase: Client = create_client(url, key)

id = 'd55b7209-39d1-4f94-856a-38e3db5029ac'
send_to_supabase = (69.69, 4.20, 19)

data = {
    'r_elbow_angle': send_to_supabase[0],
    'l_elbow_angle': send_to_supabase[1]
}

response = supabase.table('sessions').update(data).eq('id', id).execute()
print(response)