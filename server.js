console.log("APP.JS BERJALAN");
// app.js - Frontend untuk MI Salafiyah

// ============ KONFIGURASI ============
const API_URL = "http://192.168.0.104:3000"; // Sesuaikan dengan IP server

// ============ STATE ============
let users = [
    {
        id: 'admin1',
        username: 'MI Salafiyah',
        password: 'admin123',
        role: 'admin',
        avatar: 'https://ui-avatars.com/api/?name=MI+Salafiyah&background=2a5fd9&color=fff&bold=true',
        notes: ['Catatan A', 'Catatan B']
    },
    {
        id: 'user1',
        username: 'alice',
        password: 'alice123',
        role: 'user',
        avatar: 'https://ui-avatars.com/api/?name=Alice&background=8b5cf6&color=fff&bold=true',
        notes: []
    },
    {
        id: 'user2',
        username: 'budi',
        password: 'budi123',
        role: 'user',
        avatar: 'https://ui-avatars.com/api/?name=Budi&background=0ea5e9&color=fff&bold=true',
        notes: []
    }
];

let posts = [];
let currentUser = null;
let nextUserId = 100;

// ============ DOM REFS ============
const feedEl = document.getElementById('feed');
const adminPanel = document.getElementById('adminPanel');
const userListEl = document.getElementById('userList');
const currentUserDisplay = document.getElementById('currentUserDisplay');
const roleTag = document.getElementById('roleTag');
const avatarImg = document.getElementById('avatarImg');
const loginBtn = document.getElementById('loginBtn');
const logoutBtn = document.getElementById('logoutBtn');
const addUserBtn = document.getElementById('addUserBtn');
const newUsernameInput = document.getElementById('newUsername');
const newPasswordInput = document.getElementById('newPassword');
const uploadPostBtn = document.getElementById('uploadPostBtn');
const postCaption = document.getElementById('postCaption');
const postLink = document.getElementById('postLink');
const fileInput = document.getElementById('fileInput');
const resolusiSelect = document.getElementById('resolusiSelect');
const previewContainer = document.getElementById('previewContainer');
const previewMedia = document.getElementById('previewMedia');
const previewCaption = document.getElementById('previewCaption');
const profileSettings = document.getElementById('profileSettings');
const profileUsername = document.getElementById('profileUsername');
const profilePassword = document.getElementById('profilePassword');
const updateProfileBtn = document.getElementById('updateProfileBtn');
const syncToDatabaseBtn = document.getElementById('syncToDatabaseBtn');
const loadFromDatabaseBtn = document.getElementById('loadFromDatabaseBtn');

// Login popup
const loginOverlay = document.getElementById('loginOverlay');
const loginUsername = document.getElementById('loginUsername');
const loginPassword = document.getElementById('loginPassword');
const loginSubmitBtn = document.getElementById('loginSubmitBtn');
const closeLogin = document.getElementById('closeLogin');

// ============ HELPER FUNCTIONS ============
function getAvatar(username, role) {
    if (role === 'admin') return 'https://ui-avatars.com/api/?name=MI+Salafiyah&background=2a5fd9&color=fff&bold=true';
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(username)}&background=3b7cff&color=fff&bold=true`;
}

function showToast(message, type = 'success') {
    // Simple alert for now
    alert(message);
}

// ============ SYNC TO DATABASE ============
async function syncToDatabase() {
    if (currentUser?.role !== 'admin') {
        alert('Hanya admin yang bisa sync data!');
        return;
    }

    const data = {
        users: users,
        posts: posts,
        currentUser: currentUser,
        nextUserId: nextUserId,
        domElements: {
            feedEl: "#feed",
            adminPanel: "#adminPanel",
            userListEl: "#userList",
            currentUserDisplay: "#currentUserDisplay",
            roleTag: "#roleTag",
            avatarImg: "#avatarImg",
            loginBtn: "#loginBtn",
            logoutBtn: "#logoutBtn",
            addUserBtn: "#addUserBtn",
            newUsernameInput: "#newUsername",
            newPasswordInput: "#newPassword",
            uploadPostBtn: "#uploadPostBtn",
            postCaption: "#postCaption",
            postLink: "#postLink",
            fileInput: "#fileInput",
            resolusiSelect: "#resolusiSelect",
            previewContainer: "#previewContainer",
            previewMedia: "#previewMedia",
            previewCaption: "#previewCaption",
            profileSettings: "#profileSettings",
            profileUsername: "#profileUsername",
            profilePassword: "#profilePassword",
            updateProfileBtn: "#updateProfileBtn",
            loginOverlay: "#loginOverlay",
            loginUsername: "#loginUsername",
            loginPassword: "#loginPassword",
            loginSubmitBtn: "#loginSubmitBtn",
            closeLogin: "#closeLogin"
        },
        externalLinks: {
            uiAvatar: "https://ui-avatars.com/api/",
            placeholder: "https://placehold.co/",
            fontAwesome: "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css"
        },
        cssClasses: {
            deleteUser: ".delete-user",
            likeBtn: ".like-btn",
            commentSubmit: ".comment-submit",
            deletePost: ".delete-post",
            downloadBtn: ".download-btn",
            commentToggle: ".comment-toggle",
            commentMore: ".comment-more",
            deleteComment: ".delete-comment",
            sliderBtn: ".slider-btn",
            editBtn: ".edit-btn"
        },
        appConfig: {
            adminUsername: "MI Salafiyah",
            defaultPassword: "123456",
            maxCommentsVisible: 3,
            timestamp: new Date().toISOString()
        },
        eventListeners: {
            login: { element: "#loginBtn", event: "click", action: "showLoginPopup" },
            logout: { element: "#logoutBtn", event: "click", action: "logout" },
            addUser: { element: "#addUserBtn", event: "click", action: "addUser" },
            uploadPost: { element: "#uploadPostBtn", event: "click", action: "handleUpload" },
            fileInput: { element: "#fileInput", event: "change", action: "handleFilePreview" },
            updateProfile: { element: "#updateProfileBtn", event: "click", action: "updateProfile" },
            avatarClick: { element: "#avatarImg", event: "click", action: "changeProfilePicture" }
        }
    };

    try {
        const response = await fetch(`${API_URL}/users`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        
        if (result.success) {
            alert(`✅ Data berhasil disimpan!\nUsers: ${result.data.usersInserted}\nPosts: ${result.data.postsInserted}`);
            console.log('Sync result:', result);
        } else {
            alert(`❌ Gagal sync: ${result.message}`);
        }
    } catch (error) {
        console.error('Error syncing:', error);
        alert(`❌ Error: ${error.message}`);
    }
}

// ============ LOAD FROM DATABASE ============
async function loadFromDatabase() {
    if (currentUser?.role !== 'admin') {
        alert('Hanya admin yang bisa load data!');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/users`);
        const result = await response.json();
        
        if (result.success) {
            // Update state dengan data dari database
            users = result.data.users;
            posts = result.data.posts;
            currentUser = result.data.currentUser || currentUser;
            
            // Update UI
            renderUserList();
            renderFeed();
            updateAuthUI();
            
            alert(`✅ Data berhasil dimuat!\nUsers: ${users.length}\nPosts: ${posts.length}`);
            console.log('Loaded data:', result);
        } else {
            alert(`❌ Gagal load: ${result.message}`);
        }
    } catch (error) {
        console.error('Error loading:', error);
        alert(`❌ Error: ${error.message}`);
    }
}

// ============ RENDER FEED ============
function renderFeed() {
    if (!posts.length) {
        feedEl.innerHTML = `<div class="empty-state"><i class="fas fa-camera" style="font-size:2rem; opacity:0.3;"></i><p style="margin-top:0.5rem;">Belum ada postingan. Admin bisa upload!</p></div>`;
        return;
    }
    let html = '';
    for (let i = posts.length - 1; i >= 0; i--) {
        const p = posts[i];
        const isLiked = p.likes && p.likes.includes(currentUser?.id);
        const likeIcon = isLiked ? 'fas fa-heart' : 'far fa-heart';
        const likeClass = isLiked ? 'liked' : '';
        const user = users.find(u => u.id === p.userId);
        const avatar = user ? user.avatar : (p.userAvatar || getAvatar(p.username, p.role));

        let mediaHtml = '';
        if (p.mediaUrls && p.mediaUrls.length > 0) {
            const mediaItems = p.mediaUrls.map((url, idx) => {
                const isVideo = p.mediaTypes && p.mediaTypes[idx] === 'video';
                return isVideo ?
                    `<video controls muted playsinline src="${url}"></video>` :
                    `<img src="${url}" alt="post ${idx}" loading="lazy" />`;
            });
            if (mediaItems.length === 1) {
                mediaHtml = mediaItems[0];
            } else {
                const sliderId = `slider-${p.id}`;
                mediaHtml = `
                    <div class="slider-container" id="${sliderId}">
                        <div class="slider-track">
                            ${mediaItems.map(item => `<div style="flex:0 0 auto; scroll-snap-align:start;">${item}</div>`).join('')}
                        </div>
                        <button class="slider-btn prev" onclick="slidePrev('${sliderId}')"><i class="fas fa-chevron-left"></i></button>
                        <button class="slider-btn next" onclick="slideNext('${sliderId}')"><i class="fas fa-chevron-right"></i></button>
                    </div>
                `;
            }
        }

        const comments = p.comments || [];
        let commentHtml = '';
        const showAll = p.showAllComments || false;
        const visibleComments = showAll ? comments : comments.slice(0, 3);
        if (comments.length === 0) {
            commentHtml = `<span class="text-muted" style="font-size:0.75rem;">Belum ada komentar</span>`;
        } else {
            commentHtml = visibleComments.map((c, idx) => {
                const canDelete = currentUser && (currentUser.role === 'admin' || currentUser.username === c.username);
                return `<div class="comment-item">
                            <span><strong>${c.username}</strong> ${c.text}</span>
                            ${canDelete ? `<button class="delete-comment" data-postid="${p.id}" data-commentidx="${idx}"><i class="fas fa-trash-alt"></i></button>` : ''}
                        </div>`;
            }).join('');
            if (comments.length > 3) {
                if (!showAll) {
                    commentHtml += `<div class="comment-more" data-postid="${p.id}" data-action="showmore">Lihat ${comments.length - 3} komentar lainnya</div>`;
                } else {
                    commentHtml += `<div class="comment-more" data-postid="${p.id}" data-action="showless">Sembunyikan komentar</div>`;
                }
            }
        }

        const downloadBtn = (p.mediaUrls && p.mediaUrls.length > 0) ?
            `<button class="download-btn" data-postid="${p.id}"><i class="fas fa-download"></i> Download</button>` :
            '';

        html += `
            <div class="post" data-postid="${p.id}">
                <div class="post-header">
                    <span class="post-user"><img src="${avatar}" alt="avatar" /> ${p.username} <span class="tag">${p.role}</span></span>
                    <span class="text-muted" style="font-size:0.7rem;">${new Date(p.timestamp).toLocaleString()}</span>
                </div>
                ${mediaHtml ? `<div class="post-media">${mediaHtml}</div>` : ''}
                ${p.caption ? `<div class="post-caption">${p.caption}</div>` : ''}
                ${p.link ? `<a href="${p.link}" target="_blank" class="post-link"><i class="fas fa-link"></i> ${p.link}</a>` : ''}
                <div class="post-actions">
                    <button class="like-btn ${likeClass}" data-postid="${p.id}"><i class="${likeIcon}"></i> <span class="like-count">${p.likes ? p.likes.length : 0}</span></button>
                    <button class="comment-toggle" data-postid="${p.id}"><i class="far fa-comment"></i> ${comments.length}</button>
                    ${downloadBtn}
                    ${currentUser?.role === 'admin' ? `<button class="delete-post" data-postid="${p.id}"><i class="fas fa-trash-alt"></i></button>` : ''}
                </div>
                <div class="comment-section" id="commentSection-${p.id}">
                    <div class="comment-list" id="commentList-${p.id}">${commentHtml}</div>
                    ${currentUser ? `
                    <div class="comment-input" data-postid="${p.id}">
                        <input type="text" class="comment-text-input" placeholder="Tulis komentar..." />
                        <button class="comment-submit" data-postid="${p.id}">Kirim</button>
                    </div>` : `<div class="text-muted" style="font-size:0.75rem; margin-top:0.3rem;">Login untuk berkomentar</div>`}
                </div>
            </div>
        `;
    }
    feedEl.innerHTML = html;

    // Autoplay video terbesar
    setTimeout(() => {
        const videos = document.querySelectorAll('.post-media video');
        if (videos.length === 0) return;
        let bestVideo = null;
        let bestArea = 0;
        videos.forEach(v => {
            const rect = v.getBoundingClientRect();
            const area = rect.width * rect.height;
            if (area > bestArea) {
                bestArea = area;
                bestVideo = v;
            }
        });
        if (bestVideo) {
            videos.forEach(v => { if (v !== bestVideo) v.pause(); });
            bestVideo.play().catch(() => {});
        }
    }, 100);
}

// ============ SLIDER FUNCTIONS ============
window.slidePrev = function(id) {
    const container = document.getElementById(id);
    const track = container.querySelector('.slider-track');
    track.scrollLeft -= track.clientWidth;
};
window.slideNext = function(id) {
    const container = document.getElementById(id);
    const track = container.querySelector('.slider-track');
    track.scrollLeft += track.clientWidth;
};

// ============ RENDER USER LIST ============
function renderUserList() {
    userListEl.innerHTML = users.map(u => `
        <div class="user-row">
            <div class="user-info">
                <span><i class="fas fa-user-circle"></i> ${u.username}</span>
                <span class="badge">${u.role}</span>
                <span class="text-muted" style="font-size:0.7rem;">${u.password || '****'}</span>
                ${u.notes && u.notes.length > 0 ? u.notes.map(n => `<span class="note-tag">${n}</span>`).join('') : ''}
            </div>
            <div class="user-actions">
                ${u.role !== 'admin' ? `
                    <button class="edit-btn" onclick="editUser('${u.id}')"><i class="fas fa-edit"></i></button>
                    <button class="delete-user" data-userid="${u.id}"><i class="fas fa-trash-alt"></i></button>
                ` : ''}
                <button class="edit-btn" onclick="addNote('${u.id}')"><i class="fas fa-sticky-note"></i></button>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.delete-user').forEach(btn => {
        btn.addEventListener('click', function() {
            const userId = this.dataset.userid;
            if (currentUser?.role !== 'admin') return alert('Hanya admin');
            if (!confirm('Hapus user ini?')) return;
            users = users.filter(u => u.id !== userId);
            if (currentUser && currentUser.id === userId) {
                currentUser = null;
                updateAuthUI();
            }
            renderUserList();
            renderFeed();
        });
    });
}

// ============ EDIT USER ============
window.editUser = function(userId) {
    if (currentUser?.role !== 'admin') return alert('Hanya admin');
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const newUsername = prompt('Username baru:', user.username);
    if (newUsername !== null && newUsername.trim() !== '') {
        if (user.role === 'admin' && !newUsername.includes('@misala')) {
            alert('Admin harus memiliki @misala di username!');
            return;
        }
        if (user.role !== 'admin' && newUsername.includes('@misala')) {
            alert('User tidak boleh memiliki @misala!');
            return;
        }
        user.username = newUsername.trim();
    }
    const newPassword = prompt('Password baru:', user.password || '');
    if (newPassword !== null && newPassword.trim() !== '') {
        user.password = newPassword.trim();
    }
    renderUserList();
    renderFeed();
    updateAuthUI();
};

// ============ ADD NOTE ============
window.addNote = function(userId) {
    if (currentUser?.role !== 'admin') return alert('Hanya admin');
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const note = prompt('Tambahkan catatan untuk ' + user.username + ':', '');
    if (note !== null && note.trim() !== '') {
        if (!user.notes) user.notes = [];
        user.notes.push(note.trim());
        renderUserList();
    }
};

// ============ UPDATE AUTH UI ============
function updateAuthUI() {
    const isAdmin = currentUser?.role === 'admin';
    const isLoggedIn = !!currentUser;

    currentUserDisplay.textContent = currentUser ? currentUser.username : 'Tamu';
    roleTag.textContent = currentUser ? currentUser.role : 'pengunjung';
    if (currentUser) {
        const user = users.find(u => u.id === currentUser.id);
        const avatar = user ? user.avatar : (currentUser.avatar || getAvatar(currentUser.username, currentUser.role));
        avatarImg.src = avatar;
    } else {
        avatarImg.src = 'https://ui-avatars.com/api/?name=Tamu&background=3b7cff&color=fff&bold=true';
    }

    loginBtn.classList.toggle('hidden', isLoggedIn);
    logoutBtn.classList.toggle('hidden', !isLoggedIn);
    adminPanel.classList.toggle('hidden', !isAdmin);
    profileSettings.classList.toggle('hidden', !isLoggedIn);
    if (isAdmin) {
        renderUserList();
    }
    renderFeed();
}

// ============ LOGIN POPUP ============
function showLoginPopup() {
    loginUsername.value = '';
    loginPassword.value = '';
    loginOverlay.classList.add('show');
    loginUsername.focus();
}

function closeLoginPopup() {
    loginOverlay.classList.remove('show');
}

function handleLoginSubmit() {
    const username = loginUsername.value.trim();
    const password = loginPassword.value.trim();
    if (!username || !password) {
        alert('Username dan password harus diisi!');
        return;
    }
    const user = users.find(u => u.username === username && u.password === password);
    if (!user) {
        alert('Username atau password salah!');
        return;
    }
    currentUser = { ...user };
    closeLoginPopup();
    updateAuthUI();
}

// ============ LOGOUT ============
function logout() {
    currentUser = null;
    updateAuthUI();
}

// ============ ADD USER ============
function addUser() {
    if (currentUser?.role !== 'admin') return alert('Hanya admin');
    const name = newUsernameInput.value.trim();
    const pass = newPasswordInput.value.trim() || '123456';
    if (!name) return alert('Masukkan nama user');
    if (users.some(u => u.username === name)) return alert('Username sudah ada');
    if (name.includes('@misala')) {
        alert('User tidak boleh memiliki @misala!');
        return;
    }
    const newUser = {
        id: 'user' + (nextUserId++),
        username: name,
        password: pass,
        role: 'user',
        avatar: getAvatar(name, 'user'),
        notes: []
    };
    users.push(newUser);
    newUsernameInput.value = '';
    newPasswordInput.value = '';
    renderUserList();
    renderFeed();
}

// ============ UPLOAD POST ============
function handleUpload() {
    if (currentUser?.role !== 'admin') { alert('Hanya admin yang dapat mengupload.'); return; }
    const caption = postCaption.value.trim();
    const link = postLink.value.trim();
    const files = fileInput.files;
    const resolusi = resolusiSelect.value;

    if (!caption && !link && files.length === 0) {
        alert('Isi minimal caption, link, atau upload file!');
        return;
    }

    const user = users.find(u => u.id === currentUser.id);
    const mediaUrls = [];
    const mediaTypes = [];

    if (files.length > 0) {
        let loaded = 0;
        for (let f of files) {
            const reader = new FileReader();
            reader.onload = function(e) {
                mediaUrls.push(e.target.result);
                mediaTypes.push(f.type.startsWith('video') ? 'video' : 'image');
                loaded++;
                if (loaded === files.length) {
                    createPost();
                }
            };
            reader.readAsDataURL(f);
        }
    } else {
        createPost();
    }

    function createPost() {
        const post = {
            id: 'p' + Date.now(),
            userId: currentUser.id,
            username: currentUser.username,
            role: currentUser.role,
            userAvatar: user ? user.avatar : (currentUser.avatar || getAvatar(currentUser.username, currentUser.role)),
            caption: caption || '',
            link: link || '',
            mediaUrls: mediaUrls,
            mediaTypes: mediaTypes,
            timestamp: Date.now(),
            likes: [],
            comments: [],
            showAllComments: false,
        };
        posts.push(post);
        postCaption.value = '';
        postLink.value = '';
        fileInput.value = '';
        previewContainer.classList.add('hidden');
        previewMedia.innerHTML = '';
        renderFeed();
    }
}

// ============ PREVIEW FILE ============
function handleFilePreview() {
    const files = fileInput.files;
    if (files.length === 0) { previewContainer.classList.add('hidden'); previewMedia.innerHTML = ''; return; }
    let html = '';
    for (let f of files) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const dataUrl = e.target.result;
            const isVideo = f.type.startsWith('video');
            html += isVideo ?
                `<video controls muted playsinline src="${dataUrl}" style="max-height:120px; max-width:200px; border-radius:14px; margin:4px;"></video>` :
                `<img src="${dataUrl}" style="max-height:120px; max-width:200px; border-radius:14px; margin:4px;" />`;
            previewMedia.innerHTML = html;
            previewCaption.textContent = postCaption.value || '(caption kosong)';
            previewContainer.classList.remove('hidden');
        };
        reader.readAsDataURL(f);
    }
}

// ============ UPDATE PROFILE ============
function updateProfile() {
    if (!currentUser) return alert('Login dulu');
    const newUsername = profileUsername.value.trim();
    const newPassword = profilePassword.value.trim();
    const user = users.find(u => u.id === currentUser.id);
    if (!user) return;

    if (newUsername) {
        if (user.role === 'admin' && !newUsername.includes('@misala')) {
            alert('Admin harus memiliki @misala di username!');
            return;
        }
        if (user.role !== 'admin' && newUsername.includes('@misala')) {
            alert('User tidak boleh memiliki @misala!');
            return;
        }
        if (users.some(u => u.username === newUsername && u.id !== currentUser.id)) {
            alert('Username sudah digunakan!');
            return;
        }
        user.username = newUsername;
        currentUser.username = newUsername;
    }
    if (newPassword) {
        user.password = newPassword;
        currentUser.password = newPassword;
    }
    profileUsername.value = '';
    profilePassword.value = '';
    updateAuthUI();
    renderUserList();
    alert('Profil berhasil diupdate!');
}

// ============ CHANGE PROFILE PICTURE ============
function changeProfilePicture() {
    if (!currentUser) return alert('Login dulu');
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = function(e) {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = function(ev) {
            const dataUrl = ev.target.result;
            const user = users.find(u => u.id === currentUser.id);
            if (user) {
                user.avatar = dataUrl;
                currentUser.avatar = dataUrl;
                avatarImg.src = dataUrl;
                renderFeed();
            }
        };
        reader.readAsDataURL(file);
    };
    input.click();
}

// ============ DOWNLOAD MEDIA ============
function downloadMedia(postId) {
    const post = posts.find(p => p.id === postId);
    if (!post || !post.mediaUrls || post.mediaUrls.length === 0) return;
    post.mediaUrls.forEach((url, idx) => {
        const a = document.createElement('a');
        a.href = url;
        const ext = post.mediaTypes && post.mediaTypes[idx] === 'video' ? 'mp4' : 'jpg';
        a.download = `post_${postId}_${idx+1}.${ext}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}

// ============ DELETE COMMENT ============
function deleteComment(postId, commentIdx) {
    const post = posts.find(p => p.id === postId);
    if (!post) return;
    const comment = post.comments[commentIdx];
    if (!comment) return;
    if (currentUser?.role !== 'admin' && currentUser?.username !== comment.username) {
        alert('Anda tidak memiliki izin untuk menghapus komentar ini.');
        return;
    }
    post.comments.splice(commentIdx, 1);
    renderFeed();
}

// ============ FEED EVENT HANDLER ============
function handleFeedClick(e) {
    const target = e.target.closest('button');
    if (!target) return;

    // Delete Comment
    if (target.classList.contains('delete-comment')) {
        e.preventDefault();
        const postId = target.dataset.postid;
        const commentIdx = parseInt(target.dataset.commentidx);
        deleteComment(postId, commentIdx);
        return;
    }

    // Like
    if (target.classList.contains('like-btn')) {
        e.preventDefault();
        if (!currentUser) return alert('Login dulu untuk menyukai.');
        const postId = target.dataset.postid;
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        if (!post.likes) post.likes = [];
        const idx = post.likes.indexOf(currentUser.id);
        if (idx > -1) post.likes.splice(idx, 1);
        else post.likes.push(currentUser.id);
        renderFeed();
        return;
    }

    // Submit Comment
    if (target.classList.contains('comment-submit')) {
        e.preventDefault();
        if (!currentUser) return alert('Login untuk komentar');
        const postId = target.dataset.postid;
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        const section = document.getElementById(`commentSection-${postId}`);
        const input = section?.querySelector('.comment-text-input');
        if (!input) return;
        const text = input.value.trim();
        if (!text) return alert('Komentar tidak boleh kosong');
        if (!post.comments) post.comments = [];
        post.comments.push({ username: currentUser.username, text });
        input.value = '';
        renderFeed();
        return;
    }

    // Delete Post
    if (target.classList.contains('delete-post')) {
        e.preventDefault();
        if (currentUser?.role !== 'admin') return alert('Hanya admin');
        const postId = target.dataset.postid;
        if (!confirm('Hapus postingan ini?')) return;
        posts = posts.filter(p => p.id !== postId);
        renderFeed();
        return;
    }

    // Download
    if (target.classList.contains('download-btn')) {
        e.preventDefault();
        const postId = target.dataset.postid;
        downloadMedia(postId);
        return;
    }

    // Comment Toggle
    if (target.classList.contains('comment-toggle')) {
        e.preventDefault();
        const postId = target.dataset.postid;
        const section = document.getElementById(`commentSection-${postId}`);
        if (section) {
            const input = section.querySelector('.comment-text-input');
            if (input) input.focus();
            else {
                section.scrollIntoView({ behavior: 'smooth' });
            }
        }
        return;
    }

    // Show More / Less Comments
    const moreBtn = target.closest('.comment-more');
    if (moreBtn) {
        e.preventDefault();
        const postId = moreBtn.dataset.postid;
        const post = posts.find(p => p.id === postId);
        if (!post) return;
        const action = moreBtn.dataset.action;
        if (action === 'showmore') {
            post.showAllComments = true;
        } else if (action === 'showless') {
            post.showAllComments = false;
        }
        renderFeed();
        return;
    }
}

// ============ INIT ============
function init() {
    const adminUser = users.find(u => u.role === 'admin');
    posts = [{
        id: 'p1',
        userId: adminUser.id,
        username: adminUser.username,
        role: adminUser.role,
        userAvatar: adminUser.avatar,
        caption: 'Selamat datang di MI Salafiyah! 🎉',
        link: 'https://example.com',
        mediaUrls: ['https://placehold.co/600x300/3b7cff/white?text=Welcome+Post'],
        mediaTypes: ['image'],
        timestamp: Date.now() - 7200000,
        likes: ['user1'],
        comments: [
            { username: 'alice', text: 'Keren!' },
            { username: 'budi', text: 'Mantap' },
            { username: 'alice', text: 'Suka banget' },
            { username: 'MI Salafiyah', text: 'Terima kasih semua!' },
            { username: 'budi', text: 'Luar biasa' },
        ],
        showAllComments: false,
    }];

    // Event Listeners
    loginBtn.addEventListener('click', showLoginPopup);
    closeLogin.addEventListener('click', closeLoginPopup);
    loginOverlay.addEventListener('click', function(e) {
        if (e.target === this) closeLoginPopup();
    });
    loginSubmitBtn.addEventListener('click', handleLoginSubmit);
    loginUsername.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') loginPassword.focus();
    });
    loginPassword.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') handleLoginSubmit();
    });

    logoutBtn.addEventListener('click', logout);
    addUserBtn.addEventListener('click', addUser);
    uploadPostBtn.addEventListener('click', handleUpload);
    fileInput.addEventListener('change', handleFilePreview);
    postCaption.addEventListener('input', () => {
        if (fileInput.files.length === 0) return;
        previewCaption.textContent = postCaption.value || '(caption kosong)';
    });
    feedEl.addEventListener('click', handleFeedClick);
    avatarImg.addEventListener('click', changeProfilePicture);
    updateProfileBtn.addEventListener('click', updateProfile);

    // Sync & Load buttons
    syncToDatabaseBtn.addEventListener('click', syncToDatabase);
    loadFromDatabaseBtn.addEventListener('click', loadFromDatabase);

    updateAuthUI();
}

// ============ START APP ============
document.addEventListener('DOMContentLoaded', init);
