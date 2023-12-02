"""Utils module"""
import pickle

def load_pickle(path) -> any:
    """Loads pickle file"""
    with open(path, "rb") as f:
        return pickle.load(f)

