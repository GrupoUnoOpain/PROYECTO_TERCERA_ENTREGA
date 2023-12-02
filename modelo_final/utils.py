import os

def make_folder(path: str) -> None:
    """Generates a folder if it does not exist"""
    if not os.path.exists(path):
        os.makedirs(path)
