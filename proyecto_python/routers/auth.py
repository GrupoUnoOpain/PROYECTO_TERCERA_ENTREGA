from datetime import timedelta, datetime
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from starlette import status
from database import SessionLocal
from models import User
from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from jose import jwt, JWTError

# Creación de un router API con el prefijo '/auth' y la etiqueta 'auth'
router = APIRouter(
    prefix='/auth',
    tags=['auth']
)

# Definición de la clave secreta y el algoritmo para JWT
SECRET_KEY = '197b2c37c391bed93fe80344fe73b806947a65e36206e05a1a23c2fa12702fe3'
ALGORITHM = 'HS256'

# Inicialización del contexto de bcrypt para el cifrado de password
bcrypt_context = CryptContext(schemes=['bcrypt'], deprecated='auto')

# Definición del esquema para el acceso de tokens OAuth2
oauth2_bearer = OAuth2PasswordBearer(tokenUrl='auth/token')


# Definición de un esquema para crear un usuario
class CreateUserRequest(BaseModel):
    username: str
    password: str
    role: str


# Definición del esquema para el token de acceso
class Token(BaseModel):
    token: str
    type: str


# Función para obtener una sesión de base de datos
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# Definición de una dependencia de base de datos
db_dependency = Annotated[Session, Depends(get_db)]


# Función para autenticar un usuario en la base de datos
def authenticate_user(username: str, password: str, db):
    """
    Autentica a un usuario en la base de datos.

    Parameters:
    username (str): El nombre de usuario proporcionado.
    password (str): El password proporcionado.
    db (Session): Una sesión de la base de datos SQLAlchemy.

    Returns:
    Union[bool, User]:
        - Si el usuario no existe, devuelve False.
        - Si la contraseña no coincide, devuelve False.
        - Si la autenticación es exitosa, devuelve el objeto User correspondiente.
    """
    user = db.query(User).filter(User.username == username).first()
    if not user:
        return False
    if not bcrypt_context.verify(password, user.hashed_password):
        return False
    return user


# Función para crear un token de acceso
def create_access_token(username: str, user_id: int, role: str, expires_delta: timedelta):
    """
    Crea un token de acceso utilizando JWT.

    Parameters:
    username (str): El nombre de usuario.
    user_id (int): El identificador de usuario.
    role (str): El rol del usuario.
    expires_delta (timedelta): El lapso de tiempo de expiración del token.

    Returns:
    str: El token de acceso generado.
    """
    encode = {'sub': username, 'id': user_id, 'role': role}
    expires = datetime.utcnow() + expires_delta
    encode.update({'exp': expires})
    return jwt.encode(encode, SECRET_KEY, algorithm=ALGORITHM)


# Función para obtener el usuario actual basado en el token de acceso
async def get_current_user(token: Annotated[str, Depends(oauth2_bearer)]):
    """
    Obtiene el usuario actual utilizando el token de acceso.

    Parameters:
    token (str): El token de acceso proporcionado.

    Returns:
    dict: Un diccionario que contiene el nombre de usuario, el ID de usuario y el rol del usuario.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username: str = payload.get('sub')
        user_id: int = payload.get('id')
        user_role: str = payload.get('role')
        if username is None or user_id is None:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                                detail='Could not validate user.')
        return {'username': username, 'id': user_id, 'user_role': user_role}
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail='Could not validate user.')


# Ruta para obtener un token de acceso a través de autenticación de usuario
@router.post("/token", response_model=Token)
async def login_for_access_token(form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
                                 db: db_dependency):
    """
    Inicia sesión y obtiene un token de acceso para el usuario.

    Parameters:
    form_data (OAuth2PasswordRequestForm): Datos del formulario de solicitud de contraseña OAuth2.
    db (Session): Una sesión de la base de datos SQLAlchemy.

    Returns:
    Token: Un token de acceso generado.
    """
    user = authenticate_user(form_data.username, form_data.password, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED,
                            detail='Could not validate user.')
    token = create_access_token(user.username, user.id, user.role, timedelta(minutes=30))

    return {'token': token, 'type': 'Bearer'}
