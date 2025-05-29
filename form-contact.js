document.addEventListener('DOMContentLoaded', function() {
  const contactForm = document.getElementById('contactForm');
  if (!contactForm) return;

  // Função para mostrar mensagens de status
  function showFormMessage(type, message) {
    // Remove mensagens anteriores
    const existingMessage = contactForm.querySelector('.form-message');
    if (existingMessage) existingMessage.remove();

    // Cria nova mensagem
    const messageDiv = document.createElement('div');
    messageDiv.className = `form-message p-4 mb-4 rounded-lg ${type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`;
    messageDiv.textContent = message;
    
    // Insere antes do botão de submit
    const submitButton = contactForm.querySelector('button[type="submit"]');
    submitButton.parentElement.insertBefore(messageDiv, submitButton);
  }

  contactForm.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Coleta dos dados do formulário
    const formData = {
      name: contactForm.elements.name.value.trim(),
      email: contactForm.elements.email.value.trim(),
      phone: contactForm.elements.phone.value.trim(),
      company: contactForm.elements.company.value.trim(),
      message: contactForm.elements.message.value.trim(),
      _captcha: 'false',
      _template: 'table',
      _subject: `Novo contato de ${contactForm.elements.name.value.trim()}`
    };

    // Validação básica
    if (!formData.name || !formData.email || !formData.phone || !formData.message) {
      showFormMessage('error', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    // Configuração do estado de loading
    const submitButton = contactForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    submitButton.innerHTML = `
      <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
      Enviando...
    `;
    submitButton.disabled = true;

    try {
      // Envio para FormSubmit
      const response = await fetch('https://formsubmit.co/ajax/rodrigoachitzki@hotmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok || result.success === false) {
        throw new Error(result.message || 'Falha no serviço de envio');
      }

      // Sucesso
      showFormMessage('success', 'Mensagem enviada com sucesso! Entraremos em contato em breve.');
      contactForm.reset();

    } catch (error) {
      console.error('Erro no envio:', error);
      
      // Fallback para WhatsApp
      const whatsappMessage = `Olá, tentei enviar mensagem pelo site mas encontrei um problema:\n\n` +
        `*Nome:* ${formData.name}\n` +
        `*E-mail:* ${formData.email}\n` +
        `*Telefone:* ${formData.phone}\n` +
        `*Empresa:* ${formData.company || 'Não informada'}\n` +
        `*Mensagem:* ${formData.message}\n\n` +
        `*Erro ocorrido:* ${error.message || 'Erro desconhecido'}`;

      const whatsappUrl = `https://wa.me/5541991638208?text=${encodeURIComponent(whatsappMessage)}`;

      showFormMessage('error', 
        `Falha no envio. Clique no link abaixo para enviar por WhatsApp:\n\n` +
        `WhatsApp: (41) 99163-8208` +
        `<div class="mt-3">` +
        `<a href="${whatsappUrl}" target="_blank" class="inline-block bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition duration-200">` +
        `Abrir WhatsApp` +
        `</a>` +
        `</div>`);
        
    } finally {
      // Restaura o botão
      submitButton.innerHTML = originalButtonText;
      submitButton.disabled = false;
    }
    require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Configuração do transporter de e-mail
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.hotmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Rota para enviar e-mail
app.post('/api/send-email', async (req, res) => {
  try {
    const { name, email, phone, company, message } = req.body;

    // Validação básica
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ error: 'Preencha todos os campos obrigatórios' });
    }

    // Configuração do e-mail
    const mailOptions = {
      from: `"Site Contato" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_TO || 'rodrigoachitzki@hotmail.com',
      subject: `Novo contato de ${name}`,
      html: `
        <h2>Novo contato recebido</h2>
        <p><strong>Nome:</strong> ${name}</p>
        <p><strong>E-mail:</strong> ${email}</p>
        <p><strong>Telefone:</strong> ${phone}</p>
        <p><strong>Empresa:</strong> ${company || 'Não informada'}</p>
        <p><strong>Mensagem:</strong></p>
        <p>${message}</p>
        <hr>
        <p>Enviado em: ${new Date().toLocaleString()}</p>
      `
    };

    // Envia o e-mail
    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ success: true, message: 'Mensagem enviada com sucesso!' });
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    res.status(500).json({ error: 'Erro ao enviar mensagem. Tente novamente mais tarde.' });
  }
});

// Rota de teste
app.get('/', (req, res) => {
  res.send('Backend do formulário de contato está rodando!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
  });
});