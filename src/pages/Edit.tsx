import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { toast } from '@/hooks/use-toast'
import { FaTrash } from 'react-icons/fa'

interface Contact {
  id?: number
  name: string
  lastName: string
}

interface Company {
  title: string
  contacts: Contact[]
}

const companySchema = z.object({
  title: z.string().min(1, 'O nome da empresa é obrigatório.'),
})

export const Edit = () => {
  const [company, setCompany] = useState<Company>({
    title: '',
    contacts: [
      { name: '', lastName: '' },
      { name: '', lastName: '' },
    ],
  })
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchCompany = async () => {
      try {
        const response = await fetch(`https://89.116.214.70/companies/${id}`)
        if (response.ok) {
          const data: Company = await response.json()

          setCompany({ ...data })
        } else {
          console.error('Erro ao carregar empresa:', await response.text())
        }
      } catch (error) {
        console.error('Erro de conexão:', error)
      }
    }
    fetchCompany()
  }, [id])

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number,
    field: 'name' | 'lastName',
  ) => {
    const updatedContacts = [...company.contacts]
    updatedContacts[index][field] = e.target.value
    setCompany({ ...company, contacts: updatedContacts })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Filtra contatos válidos (com name e lastName preenchidos)
    const validContacts = company.contacts.filter(
      (contact) => contact.name.trim() !== '' && contact.lastName.trim() !== '',
    )

    const companyToSubmit = { ...company, contacts: validContacts }

    const validation = companySchema.safeParse(companyToSubmit)
    if (!validation.success) {
      const formattedErrors: { [key: string]: string } = {}
      validation.error.errors.forEach((err) => {
        const field = err.path.join('.')
        formattedErrors[field] = err.message
      })
      setErrors(formattedErrors)
      return
    }

    setErrors({})
    try {
      const response = await fetch(`https://89.116.214.70/companies/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyToSubmit),
      })

      if (response.ok) {
        toast({
          description: 'Empresa atualizada com sucesso!',
          variant: 'success',
          duration: 1500,
        })
        setTimeout(() => {
          navigate('/')
        }, 1000)
      } else {
        console.error('Erro ao atualizar empresa:', await response.text())
      }
    } catch (error) {
      console.error('Erro de conexão:', error)
    }
  }

  const handleDeleteContact = async (contactId?: number) => {
    if (!contactId) {
      setCompany((prev) => ({
        ...prev,
        contacts: prev.contacts.filter((contact) => contact.id !== contactId),
      }))
      return
    }

    try {
      const response = await fetch(
        `https://89.116.214.70/companies/contact/${contactId}`,
        {
          method: 'DELETE',
        },
      )

      if (response.ok) {
        toast({
          description: 'Contato removido com sucesso!',
          variant: 'success',
          duration: 1500,
        })
        setCompany((prev) => ({
          ...prev,
          contacts: prev.contacts.filter((contact) => contact.id !== contactId),
        }))
      } else {
        console.error('Erro ao remover contato:', await response.text())
      }
    } catch (error) {
      console.error('Erro de conexão:', error)
    }
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-200 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">Editar Empresa</h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl bg-gray-800 p-8 rounded-lg shadow-lg"
      >
        <div className="mb-6">
          <label className="block mb-2 text-gray-300 font-medium">
            Nome da Empresa
          </label>
          <input
            type="text"
            name="title"
            value={company.title}
            onChange={(e) => setCompany({ ...company, title: e.target.value })}
            className={`w-full p-4 rounded-lg text-gray-900 ${
              errors.title
                ? 'border-red-500 focus:ring-red-500'
                : 'border-gray-700 focus:ring-blue-500'
            } border focus:outline-none focus:ring-2 transition`}
            placeholder="Digite o nome da empresa"
          />
          {errors.title && (
            <p className="text-red-500 mt-2 text-sm">{errors.title}</p>
          )}
        </div>

        {company.contacts.map((contact, index) => (
          <div key={index} className="mb-6 flex items-center gap-4">
            <div className="flex-1">
              <label className="block mb-2 text-gray-300 font-medium">
                Nome do Contato {index + 1}
              </label>
              <input
                type="text"
                value={contact.name}
                onChange={(e) => handleInputChange(e, index, 'name')}
                className="w-full p-4 rounded-lg text-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition mb-4"
                placeholder={`Digite o nome do contato ${index + 1}`}
              />
              <label className="block mb-2 text-gray-300 font-medium">
                Sobrenome do Contato {index + 1}
              </label>
              <input
                type="text"
                value={contact.lastName}
                onChange={(e) => handleInputChange(e, index, 'lastName')}
                className="w-full p-4 rounded-lg text-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                placeholder={`Digite o sobrenome do contato ${index + 1}`}
              />
            </div>
            <button
              type="button"
              onClick={() => handleDeleteContact(contact.id)}
              className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-500 transition"
            >
              <FaTrash />
            </button>
          </div>
        ))}

        <button
          type="button"
          onClick={() =>
            setCompany((prev) => ({
              ...prev,
              contacts: [...prev.contacts, { name: '', lastName: '' }],
            }))
          }
          className="mb-6 bg-green-600 text-white py-2 px-4 rounded-lg shadow-md hover:bg-green-500 transform transition-transform duration-200 hover:scale-105 text-lg font-medium"
        >
          Adicionar Contato
        </button>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-4 rounded-lg shadow-md hover:bg-blue-500 transform transition-transform duration-200 hover:scale-105 text-lg font-medium"
        >
          Atualizar
        </button>
      </form>
    </div>
  )
}
