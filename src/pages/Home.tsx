import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog'

export interface Contact {
  id: number
  name: string
  lastName: string
}

export interface Company {
  id: number
  title: string
  contacts: Contact[]
}

export const Home = () => {
  const [companies, setCompanies] = useState<Company[]>([])
  const [selectedCompany, setSelectedCompany] = useState<number | null>(null)
  const navigate = useNavigate()

  const handleNewRegisterClick = () => {
    navigate('/register')
  }

  const handleEdit = (id: number) => {
    navigate(`/edit/${id}`)
  }

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`https://89.116.214.70/companies/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        setCompanies((prevCompanies) =>
          prevCompanies.filter((company) => company.id !== id),
        )
      } else {
        console.error('Erro ao excluir empresa:', await response.text())
      }
    } catch (error) {
      console.error('Erro de conexão:', error)
    }
  }

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('https://89.116.214.70/companies/')
        const data: Company[] = await response.json()
        setCompanies(data)
      } catch (error) {
        console.error('Erro ao buscar dados:', error)
      }
    }

    fetchCompanies()
  }, [])

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-400">
        Desafio Br24
      </h1>
      <div className="flex justify-end mb-6">
        <button
          className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg shadow-md transform transition-transform duration-200 hover:scale-105"
          onClick={handleNewRegisterClick}
        >
          Novo registro
        </button>
      </div>
      <div className="overflow-x-auto shadow-lg rounded-lg border border-gray-700">
        <table className="w-full text-left text-sm bg-gray-800 rounded-lg">
          <thead className="bg-gray-700 text-gray-200">
            <tr>
              <th className="px-4 py-2">#</th>
              <th className="px-4 py-2">Company Title</th>
              <th className="px-4 py-2">Contact Name</th>
              <th className="px-4 py-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company, index) => (
              <tr
                key={company.id}
                className={`hover:bg-gray-700 transition duration-200 ${
                  index % 2 === 0 ? 'bg-gray-800' : 'bg-gray-900'
                }`}
              >
                <td className="px-4 py-2">{company.id}</td>
                <td className="px-4 py-2">{company.title}</td>
                <td className="px-4 py-2">
                  {company.contacts.map((contact) => (
                    <div key={contact.id}>
                      {contact.name} {contact.lastName}
                    </div>
                  ))}
                </td>
                <td className="px-4 py-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEdit(company.id)}
                      className="bg-blue-500 hover:bg-blue-400 text-white px-3 py-1 rounded-md shadow-md transition-transform transform hover:scale-105"
                    >
                      Editar
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          onClick={() => setSelectedCompany(company.id)}
                          className="bg-red-500 hover:bg-red-400 text-white px-3 py-1 rounded-md shadow-md transition-transform transform hover:scale-105"
                        >
                          Excluir
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <h2 className="text-lg font-bold text-gray-800">
                          Confirmação
                        </h2>
                        <p className="mt-2 text-gray-600">
                          Tem certeza que deseja excluir a empresa{' '}
                          <strong>{company.title}</strong>?
                        </p>
                        <div className="mt-4 flex justify-end space-x-4">
                          <AlertDialogCancel className="bg-gray-200 px-4 py-2 rounded-md hover:bg-gray-300 transition">
                            Cancelar
                          </AlertDialogCancel>
                          <AlertDialogAction
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-400 transition"
                            onClick={() => handleDelete(selectedCompany!)}
                          >
                            Confirmar
                          </AlertDialogAction>
                        </div>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
