from flask import Flask, render_template, request, redirect, url_for, flash, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
import os
import functools # Importar functools
from jinja2.exceptions import TemplateNotFound # Importar TemplateNotFound
import json # Importar json
from whitenoise import WhiteNoise

app = Flask(__name__)

# Configuración de la base de datos SQLite
# Para producción, es crucial establecer SECRET_KEY y DATABASE_URL como variables de entorno.
# SECRET_KEY debe ser una cadena larga, aleatoria y secreta.
app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY')
if not app.config['SECRET_KEY']:
    print("ADVERTENCIA: SECRET_KEY no está configurada como variable de entorno. "
          "Generando una clave temporal para desarrollo. ESTO NO ES SEGURO PARA PRODUCCIÓN Y "
          "CAUSARÁ QUE LAS SESIONES SE INVALIDEN EN CADA REINICIO.")
    app.config['SECRET_KEY'] = os.urandom(24).hex()

# DATABASE_URL debe apuntar a tu base de datos de producción (ej. PostgreSQL, MySQL).
# Para desarrollo, se usa 'sqlite:///site.db' si DATABASE_URL no está definida.
# Ejemplo para SQLite en producción con ruta absoluta: 'sqlite:////var/www/myapp/prod.db'
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get('DATABASE_URL', 'sqlite:///site.db')
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False # Desactiva el seguimiento de modificaciones de SQLAlchemy

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)

# Configurar WhiteNoise para servir archivos estáticos en producción
# Asume que tus archivos estáticos están en una carpeta llamada 'static' en la raíz del proyecto.
# Si se llama diferente (ej. 'public'), cambia 'static/' por 'public/'.
# WhiteNoise buscará automáticamente una carpeta 'static' si no se especifica root.
# app.wsgi_app = WhiteNoise(app.wsgi_app, root='static/') 
# De forma más simple, si la carpeta es 'static' y está en la raíz, puedes hacer:
app.wsgi_app = WhiteNoise(app.wsgi_app)
app.wsgi_app.add_files(os.path.join(os.path.dirname(__file__), 'static'), prefix='static/')


# Definición del modelo de Usuario
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(20), unique=True, nullable=False)
    password_hash = db.Column(db.String(60), nullable=False) # Hash de la contraseña
    quiz_progress = db.Column(db.Text, nullable=True) # JSON string para el progreso

    def __repr__(self):
        return f"User('{self.username}')"

# Decorador para rutas que requieren inicio de sesión
def login_required(func):
    @functools.wraps(func)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            flash('Debes iniciar sesión para acceder a esta página.', 'info')
            return redirect(url_for('login', next=request.url))
        return func(*args, **kwargs)
    return decorated_function

# Ruta de la página de inicio pública (antes era el dashboard)
@app.route("/")
def index_page():
    return render_template('index.html', title='Página Principal') # Asumiendo que index.html está en templates

# Ruta del Dashboard (antes era home en /)
@app.route("/dashboard")
@login_required
def dashboard():
    return render_template('home_dashboard.html', title='Mi Dashboard')

# Ruta de Registro
@app.route("/register", methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        existing_user = User.query.filter_by(username=username).first()
        if existing_user:
            flash('Ese nombre de usuario ya existe. Por favor, elige otro.', 'error')
            return redirect(url_for('register'))
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(username=username, password_hash=hashed_password)
        try:
            db.session.add(new_user)
            db.session.commit()
            flash('¡Tu cuenta ha sido creada! Ahora puedes iniciar sesión.', 'success')
            return redirect(url_for('login'))
        except Exception as e:
            db.session.rollback()
            flash(f'Error al crear la cuenta: {str(e)}', 'error')
            return redirect(url_for('register'))
    return render_template('register.html', title='Registro')

# Ruta de Login
@app.route("/login", methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        user = User.query.filter_by(username=username).first()
        if user and bcrypt.check_password_hash(user.password_hash, password):
            session['user_id'] = user.id
            session['username'] = user.username
            flash('Has iniciado sesión correctamente.', 'success')
            next_page = request.args.get('next')
            return redirect(next_page or url_for('dashboard')) # Redirigir a dashboard después de login
        else:
            flash('Inicio de sesión fallido. Verifica tu nombre de usuario y contraseña.', 'error')
            return redirect(url_for('login'))
    return render_template('login.html', title='Iniciar Sesión')

# Ruta de Logout
@app.route("/logout")
def logout():
    session.pop('user_id', None)
    session.pop('username', None)
    flash('Has cerrado sesión.', 'info')
    return redirect(url_for('login'))

# Provisionalmente, una página de dashboard
@app.route("/dashboard_contenido")
@login_required
def dashboard_contenido():
    return "Este es el Dashboard Secreto. ¡Solo para usuarios logueados!"

# Ruta para servir las páginas de los métodos numéricos
@app.route("/methods/<path:method_name>")
@login_required
def method_page(method_name):
    template_path = f"methods/{method_name}.html"
    user_id = session.get('user_id')
    current_user = User.query.get(user_id) if user_id else None

    try:
        # Verificar si el method_name podría ser problemático (ej. vacío o con caracteres inesperados)
        if not method_name or not method_name.strip():
            flash(f"Nombre de método inválido: '{method_name}'", "error")
            return render_template("404.html", error_message="Nombre de método inválido.", current_user=current_user), 404

        title = method_name.replace('-', ' ').title()
        print(f"Intentando renderizar: templates/{template_path} con título: {title}") # Línea de depuración
        # Pasar current_user al template
        return render_template(template_path, title=title, current_user=current_user)
    except TemplateNotFound:
        error_msg = f"No se encontró la plantilla: templates/{template_path}"
        print(error_msg)
        flash(error_msg, "error")
        return render_template("404.html", error_message=error_msg, current_user=current_user), 404
    except Exception as e:
        error_msg = f"Ocurrió un error al cargar el método '{method_name}': {str(e)}"
        print(error_msg)
        raise e

# Nueva función para crear la base de datos y tablas
def create_tables():
    with app.app_context():
        db.create_all()
    print("Base de datos y tablas creadas si no existían.")

@app.route("/api/save_progress", methods=['POST'])
@login_required
def save_progress():
    data = request.get_json()
    if not data or 'page_key' not in data or 'progress_data' not in data:
        return jsonify({'status': 'error', 'message': 'Datos incompletos.'}), 400

    user_id = session.get('user_id')
    user = User.query.get(user_id)
    if not user:
        return jsonify({'status': 'error', 'message': 'Usuario no encontrado.'}), 404

    page_key = data['page_key']
    progress_data = data['progress_data']

    current_progress_json = user.quiz_progress
    if current_progress_json:
        try:
            all_progress = json.loads(current_progress_json)
        except json.JSONDecodeError:
            all_progress = {} # Si hay error en JSON, empezar de nuevo
    else:
        all_progress = {}

    all_progress[page_key] = progress_data
    user.quiz_progress = json.dumps(all_progress)

    try:
        db.session.commit()
        return jsonify({'status': 'success', 'message': 'Progreso guardado.'})
    except Exception as e:
        db.session.rollback()
        app.logger.error(f"Error al guardar progreso para {user.username}, page {page_key}: {e}")
        return jsonify({'status': 'error', 'message': f'Error al guardar progreso: {str(e)}'}), 500

@app.route("/api/check_auth", methods=['GET'])
def check_auth():
    # Verificar si el usuario está autenticado basado en la sesión
    is_authenticated = 'user_id' in session
    return jsonify({
        'authenticated': is_authenticated,
        'user_id': session.get('user_id') if is_authenticated else None
    })

@app.route("/api/load_progress/<path:page_key>", methods=['GET'])
@login_required
def load_progress(page_key):
    # Solo permitir cargar progreso si el usuario está autenticado
    if 'user_id' not in session:
        return jsonify({'error': 'Usuario no autenticado'}), 401
    
    user_id = session['user_id']
    user = User.query.get(user_id)
    
    if not user or not user.quiz_progress:
        return jsonify({'error': 'No se encontró progreso para este usuario'}), 404
    
    try:
        progress_data = json.loads(user.quiz_progress)
        if page_key in progress_data:
            return jsonify({'progress': progress_data[page_key]})
        else:
            return jsonify({'error': f'No se encontró progreso para la página {page_key}'}), 404
    except Exception as e:
        return jsonify({'error': f'Error al cargar progreso: {str(e)}'}), 500

if __name__ == '__main__':
    # Este bloque se ejecuta solo cuando el script se corre directamente (e.g., `python app.py`).
    # Es útil para desarrollo local. En producción, un servidor WSGI como Gunicorn
    # importará la variable `app` directamente y no ejecutará este bloque.
    
    # Flask (>=2.3) maneja el modo debug basado en las variables de entorno FLASK_ENV o FLASK_DEBUG.
    # - Si FLASK_ENV=development, debug=True.
    # - Si FLASK_ENV=production, debug=False.
    # - Si FLASK_DEBUG=1, debug=True. Si FLASK_DEBUG=0, debug=False.
    # Por defecto, si ninguna está configurada, Flask asume entorno de producción (debug=False).
    
    # Para ejecutar en desarrollo local (asegúrate de tener FLASK_ENV=development o FLASK_DEBUG=1):
    # Ejemplo: $ FLASK_ENV=development python app.py
    # Opcionalmente, puedes crear las tablas aquí para desarrollo:
    # with app.app_context():
    #     db.create_all()
    app.run() # No pasar debug=True directamente. Dejar que Flask lo maneje.

# --- RUTA TEMPORAL PARA CREAR TABLAS EN PRODUCCIÓN (SOLO RENDER FREE TIER) ---
# !!! IMPORTANTE: Visita esta ruta UNA SOLA VEZ después del primer despliegue !!!
# !!! LUEGO, ELIMINA O COMENTA ESTA RUTA Y REDESPLIEGA POR SEGURIDAD !!!
@app.route('/create-initial-db-tables-a1b2c3d4e5f6-do-not-share') # ¡Cambia esta URL secreta!
def create_initial_tables_route():
    # Considera añadir algún tipo de autenticación o token aquí si necesitas más seguridad,
    # pero para un uso único y luego eliminación, una URL muy secreta puede ser suficiente.
    try:
        with app.app_context():
            db.create_all()
        return "Tablas creadas (o ya existían). ¡Recuerda eliminar esta ruta!", 200
    except Exception as e:
        return f"Error al crear tablas: {str(e)}", 500
# --- FIN DE RUTA TEMPORAL ---
              # Puedes especificar host y port para desarrollo: app.run(host=os.environ.get('HOST', '127.0.0.1'), port=int(os.environ.get('PORT', 5000))) 