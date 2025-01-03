import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import { toast } from '@/hooks/use-toast'

interface Contact {
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

export const Register = () => {
  const [company, setCompany] = useState<Company>({
    title: '',
    contacts: [
      { name: '', lastName: '' },
      { name: '', lastName: '' },
    ],
  })

  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const navigate = useNavigate()

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index?: number,
    field?: keyof Contact,
  ) => {
    const { name, value } = e.target

    if (index !== undefined && field) {
      const updatedContacts = [...company.contacts]
      updatedContacts[index][field] = value

      const errorKey = `contacts.${index}.${field}`
      const updatedErrors = { ...errors }
      delete updatedErrors[errorKey]

      setCompany({ ...company, contacts: updatedContacts })
      setErrors(updatedErrors)
    } else {
      setCompany({ ...company, [name]: value })

      const updatedErrors = { ...errors }
      delete updatedErrors[name]
      setErrors(updatedErrors)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = companySchema.safeParse(company)

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
      const response = await fetch(
        'https://84b7-2a02-4780-14-5ef7-00-1.ngrok-free.app/companies',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(company),
        },
      )

      if (response.ok) {
        const data = await response.json()
        console.log('Empresa criada com sucesso:', data)

        setCompany({
          title: '',
          contacts: [
            { name: '', lastName: '' },
            { name: '', lastName: '' },
          ],
        })

        toast({
          description: 'Empresa cadastrada com sucesso!',
          variant: 'success',
          duration: 1500,
        })

        setTimeout(() => {
          navigate('/')
        }, 1000)
      } else {
        console.error('Erro ao criar empresa:', await response.text())
      }
    } catch (error) {
      console.error('Erro de conexão:', error)
    }
  }

  return (
    <div className="p-6 bg-gray-900 min-h-screen text-gray-200 flex flex-col items-center justify-center">
      <h1 className="text-4xl font-bold mb-8 text-blue-400">
        Cadastrar Empresa
      </h1>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-2xl bg-gray-800 p-8 rounded-lg shadow-lg"
      >
        <div className="mb-6">
          <label className="block mb-2 text-gray-300 font-medium">
            Nome da Empresa
          </label>
          <input
            type="text"
            name="title"
            value={company.title}
            onChange={handleInputChange}
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
          <div key={index} className="mb-6">
            <label className="block mb-2 text-gray-300 font-medium">
              Nome do Contato {index + 1}
            </label>
            <input
              type="text"
              value={contact.name}
              onChange={(e) => handleInputChange(e, index, 'name')}
              className="w-full p-4 rounded-lg text-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition mb-4"
              placeholder="Digite o nome do contato"
            />
            <label className="block mb-2 text-gray-300 font-medium">
              Sobrenome do Contato {index + 1}
            </label>
            <input
              type="text"
              value={contact.lastName}
              onChange={(e) => handleInputChange(e, index, 'lastName')}
              className="w-full p-4 rounded-lg text-gray-900 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
              placeholder="Digite o sobrenome do contato"
            />
          </div>
        ))}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-4 rounded-lg shadow-md hover:bg-blue-500 transform transition-transform duration-200 hover:scale-105 text-lg font-medium"
        >
          Cadastrar
        </button>
      </form>
    </div>
  )
}
