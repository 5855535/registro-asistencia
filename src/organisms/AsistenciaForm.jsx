/* eslint-disable react-hooks/set-state-in-effect */
import { useEffect } from "react";
import { query, where, orderBy, onSnapshot } from "firebase/firestore";

// Dentro de tu componente AsistenciaForm, añade este nuevo estado y efecto:
const [historial, setHistorial] = useState([]);

useEffect(() => {
  // Consulta: Dame las asistencias del usuario logueado, ordenadas por hora
  const q = query(
    collection(db, "asistencias"),
    where("usuario", "==", user.email),
    orderBy("timestamp", "desc"),
  );

  const unsubscribe = onSnapshot(q, (snapshot) => {
    const registros = [];
    snapshot.forEach((doc) => {
      registros.push({ id: doc.id, ...doc.data() });
    });
    setHistorial(registros);
  });

  return () => unsubscribe();
}, [user]);

// Se renderiza en el JSX:
return (
  <div>
    {/* ... botones anteriores ... */}

    <h3>Tu Historial Reciente</h3>
    <ul>
      {historial.map((reg) => (
        <li key={reg.id}>
          <strong>{reg.tipo}</strong> - {reg.fecha} En:{" "}
          {reg.timestamp?.toDate().toLocaleTimeString()}
        </li>
      ))}
    </ul>
  </div>
);
