
    const firebaseConfig = {
      apiKey: "AIzaSyDfehi3batpF-DlyvI-HVtJoBBooXuC8sc",
      authDomain: "portfolio-mali.firebaseapp.com",
      databaseURL: "https://portfolio-mali-default-rtdb.firebaseio.com",
      projectId: "portfolio-mali",
      storageBucket: "portfolio-mali.firebasestorage.app",
      messagingSenderId: "767019931608",
      appId: "1:767019931608:web:908407842d42c01bbb84ad"
    };

    firebase.initializeApp(firebaseConfig);
    const db = firebase.database();   // MUST be global
