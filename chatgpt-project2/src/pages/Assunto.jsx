import React, { useState, useEffect } from 'react';
import Header from '../components/Header';

function Assunto() {
	const [materias, setMaterias] = useState([]);
	const [assuntos, setAssuntos] = useState([]);
	const [nomeAssunto, setNomeAssunto] = useState('');
	const [materiaSelecionada, setMateriaSelecionada] = useState('');
	const [modalVisible, setModalVisible] = useState(false);
	const [assuntoEmEdicao, setAssuntoEmEdicao] = useState(null);
	const [termoPesquisa, setTermoPesquisa] = useState('');

	useEffect(() => {
		const fetchMaterias = async () => {
			const response = await fetch('http://localhost:8080/materias');
			const data = await response.json();
			setMaterias(data);
		};

		const fetchAssuntos = async () => {
			const response = await fetch('http://localhost:8080/assuntos');
			const data = await response.json();
			setAssuntos(data);
		};

		fetchMaterias();
		fetchAssuntos();
	}, []);

	const handleSaveAssunto = async (e) => {
    e.preventDefault();
    const assuntoId = assuntoEmEdicao ? assuntoEmEdicao.id : null;
    const url = assuntoEmEdicao ? `http://localhost:8080/assuntos/${assuntoId}` : `http://localhost:8080/assuntos`;
    const method = assuntoEmEdicao ? 'PUT' : 'POST';
    const body = JSON.stringify({
        id: assuntoId,
        nome: nomeAssunto,
        materia: { id: parseInt(materiaSelecionada) }
    });
		
    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
            },
            body,
        });

        if (response.ok) {
            const savedAssunto = await response.json();
            setAssuntos((prevAssuntos) =>
                prevAssuntos.some((assunto) => assunto.id === savedAssunto.id)
                    ? prevAssuntos.map((assunto) =>
                        assunto.id === savedAssunto.id ? savedAssunto : assunto
                    )
                    : [...prevAssuntos, savedAssunto]
            );
            resetModal();
        } else {
            const errorText = await response.text();
            console.error('Error:', errorText);
            alert("Falha ao salvar assunto. Tente novamente.");
        }
    } catch (error) {
        console.error('Network error:', error);
        alert("Erro de rede. Verifique sua conexão.");
    }
};

	const abrirModal = (assunto) => {
		setNomeAssunto(assunto ? assunto.nome : '');
		setMateriaSelecionada(assunto ? assunto.materia.id.toString() : '');
		setAssuntoEmEdicao(assunto);
		setModalVisible(true);
	};

	const fecharModal = () => resetModal();

	const resetModal = () => {
		setNomeAssunto('');
		setMateriaSelecionada('');
		setAssuntoEmEdicao(null);
		setModalVisible(false);
	};

	const handleSearchChange = (e) => {
		setTermoPesquisa(e.target.value.toLowerCase());
	};

	const assuntosFiltrados = assuntos.filter(
		(assunto) =>
			assunto.nome.toLowerCase().includes(termoPesquisa) ||
			materias.find((materia) => materia.id === assunto.materia.id)?.nome.toLowerCase().includes(termoPesquisa)
	);

	return (
		<div className="bg-base-200 flex flex-col gap-10 p-10">
			<Header />
			<i class="fa-solid fa-magnifying-glass absolute top-44 mt-3 ml-1 left-12"></i>
			<input
				type="text"
				placeholder="Digite para pesquisar"
				className="input input-bordered w-full my-2 pl-10"
				value={termoPesquisa}
				onChange={handleSearchChange}
			/>
			<button className="btn btn-outline w-40" onClick={() => abrirModal(null)}>Novo assunto</button>

			{modalVisible && (
				<dialog open className="modal">
					<div className="modal-box">
						<h3>{assuntoEmEdicao ? "Edite o assunto" : "Adicione o assunto"}: </h3>
						<button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2" onClick={fecharModal}>✕</button>
						<input
							type="text"
							placeholder="Digite o assunto"
							className="input input-bordered w-full my-2"
							value={nomeAssunto}
							onChange={(e) => setNomeAssunto(e.target.value)}
						/>
						<select
							className="select select-bordered w-full my-2"
							value={materiaSelecionada}
							onChange={(e) => setMateriaSelecionada(e.target.value)}
						>
							<option value="">Selecione uma matéria</option>
							{materias.map((materia) => (
								<option key={materia.id} value={materia.id}>{materia.nome}</option>
							))}
						</select>
						<button className="btn btn-primary" onClick={handleSaveAssunto}>Salvar</button>
					</div>
				</dialog>
			)}

			<table className="border-collapse border border-gray-400 w-full">
				<thead>
					<tr>
						<th className="w-14 text-center border border-gray-400">Id</th>
						<th className="px-10 text-start border border-gray-400">Nome</th>
						<th class="px-10 text-start border border-gray-400">Matéria</th>
						<th className="w-40 border border-gray-400">Ação</th>
					</tr>
				</thead>
				<tbody>
					{assuntosFiltrados.map((assunto) => (
						<tr key={assunto.id} className="border-b border-gray-400">
							<td className="text-center border border-gray-400">
								<span>{assunto.id}</span>
							</td>
							<td className="px-10 text-start border border-gray-400">
								<h4>{assunto.nome}</h4>
							</td>
							<td className="px-10 text-start border border-gray-400">
								<h4>{materias.find((m) => m.id === assunto.materia.id)?.nome}</h4>
							</td>
							<td className="text-center border border-gray-400 p-2">
								<button className="btn btn-outline w-20 min-h-5 h-8 mx-2" onClick={() => abrirModal(assunto)}>Editar</button>
								<i class="fa-solid fa-trash-can"></i>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>
	);
}

export default Assunto;
