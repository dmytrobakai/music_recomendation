from db_models import Base
from db_config import engine

def init_db():
    Base.metadata.create_all(bind=engine)