// Se ejecuta cuando todo el contenido del documento HTML ha sido completamente cargado
document.addEventListener('DOMContentLoaded', async () => {
    
    // Se asignan referencias a los elementos del DOM
    const searchInput = document.getElementById('searchInput');  // Referencia al campo de búsqueda
    const userDropdown = document.getElementById('userDropdown');  // Referencia al dropdown de usuarios
    const postsContainer = document.getElementById('postsContainer');  // Referencia al contenedor de posts
    const loadingIndicator = document.getElementById('loading');  // Referencia al indicador de carga
    const errorIndicator = document.getElementById('error');  // Referencia al mensaje de error

    let posts = [];  // Variable para almacenar los posts obtenidos
    let users = [];  // Variable para almacenar los usuarios obtenidos

    try {
        loadingIndicator.style.display = 'block';  // Muestra el indicador de carga mientras se esperan los datos

        // Realiza ambas peticiones HTTP de manera paralela utilizando Promise.all
        const [postsResponse, usersResponse] = await Promise.all([
            fetch('https://jsonplaceholder.typicode.com/posts'),  // Solicita los posts
            fetch('https://jsonplaceholder.typicode.com/users')  // Solicita los usuarios
        ]);

        // Verifica si alguna de las respuestas fue incorrecta (por ejemplo, 404 o 500)
        if (!postsResponse.ok || !usersResponse.ok) {
            throw new Error('Error en la carga de datos');  // Si hay un error en la respuesta, lanza un error
        }

        // Convierte las respuestas en formato JSON
        posts = await postsResponse.json();
        users = await usersResponse.json();

        // Llena el dropdown de usuarios con los nombres de los usuarios obtenidos
        users.forEach(user => {
            const option = document.createElement('option');  // Crea una opción para el dropdown
            option.value = user.id;  // Asigna el ID del usuario como valor de la opción
            option.textContent = user.name;  // Asigna el nombre del usuario como texto de la opción
            userDropdown.appendChild(option);  // Añade la opción al dropdown
        });

        loadingIndicator.style.display = 'none';  // Oculta el indicador de carga cuando los datos se han cargado
        renderPosts(posts);  // Muestra los posts cargados inicialmente

    } catch (error) {
        loadingIndicator.style.display = 'none';  // Si ocurre un error, oculta el indicador de carga
        errorIndicator.style.display = 'block';  // Muestra el mensaje de error
        console.error('Error al cargar los datos:', error);  // Muestra el error en la consola
    }

    // Escucha los eventos de entrada en el campo de búsqueda y cambio en el dropdown
    searchInput.addEventListener('input', filterPosts);  // Detecta cambios en el campo de búsqueda
    userDropdown.addEventListener('change', filterPosts);  // Detecta cambios en el dropdown de usuarios

    // Función para filtrar los posts según el término de búsqueda y el usuario seleccionado
    function filterPosts() {
        const searchTerm = searchInput.value.toLowerCase();  // Obtiene el término de búsqueda y lo convierte a minúsculas
        const selectedUserId = userDropdown.value;  // Obtiene el id del usuario seleccionado en el dropdown

        // Filtra los posts basándose en si coinciden con el término de búsqueda y con el usuario seleccionado
        const filteredPosts = posts.filter(post => {
            // Verifica si el título o el cuerpo del post contiene el término de búsqueda
            const matchesSearchTerm = post.title.toLowerCase().includes(searchTerm) || post.body.toLowerCase().includes(searchTerm);
            // Si se seleccionó un usuario, filtra por el userId, si no, se incluyen todos los posts
            const matchesUser = selectedUserId ? post.userId == selectedUserId : true;
            return matchesSearchTerm && matchesUser;  // Devuelve los posts que cumplen ambas condiciones
        });

        renderPosts(filteredPosts);  // Llama a la función para mostrar los posts filtrados
    }

    // Función para renderizar los posts en el DOM
    function renderPosts(posts) {
        postsContainer.innerHTML = '';  // Limpia el contenedor de posts antes de agregar nuevos

        // Itera sobre los posts filtrados y crea un elemento para cada uno
        posts.forEach(post => {
            const postElement = document.createElement('div');  // Crea un nuevo contenedor para el post
            postElement.classList.add('post');  // Añade la clase 'post' para aplicar los estilos CSS

            // Busca el nombre del usuario basado en el userId del post
            const user = users.find(user => user.id === post.userId);

            // Inserta el HTML del post, incluyendo el título, el nombre del usuario y el cuerpo
            postElement.innerHTML = `
                <h3>${post.title}</h3>
                <p><strong>Autor:</strong> ${user ? user.name : 'Desconocido'}</p>
                <p>${post.body}</p>
            `;

            // Añade el post al contenedor principal de posts
            postsContainer.appendChild(postElement);
        });
    }
});
