# 📄 DANFE & DACTE Generator Pro

<div align="left">
  <img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript" />
  <img src="https://img.shields.io/badge/Vite-6-646cff?style=for-the-badge&logo=vite" />
  <img src="https://img.shields.io/badge/NF--e-Modelo%2055-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/CT--e-Modelo%2057-indigo?style=for-the-badge" />
  <img src="https://img.shields.io/badge/Privacy-100%25%20Client--Side-emerald?style=for-the-badge&logo=shield" />
</div>

<br />

**DANFE & DACTE Generator Pro** é uma ferramenta web de alta performance para leitura, conferência e geração visual dos documentos auxiliares fiscais **DANFE (NF-e - Modelo 55)** e **DACTE (CT-e - Modelo 57)** a partir do arquivo XML emitido pela SEFAZ.

Construído com foco em **privacidade e velocidade absoluta**: todo o processamento dos dados fiscais é executado na memória local do navegador (Web APIs `DOMParser`), sem tráfego de dados para servidores externos.

---

## ✨ Principais Recursos

- 📦 **Suporte Completo a NF-e (Modelo 55 - DANFE):**
  - Identificação de emitente, destinatário e dados de emissão.
  - Tabela detalhada de itens com NCM, CST, CFOP, quantidades e alíquotas de ICMS/IPI.
  - Totalizadores fiscais (Base de Cálculo, ICMS, ICMS ST, PIS, COFINS, Frete, Desconto e Total da Nota).
- 🚚 **Suporte a CT-e (Modelo 57 - DACTE):**
  - Rota de transporte com cidades e UFs de início e término da prestação.
  - Partes do transporte (Remetente, Destinatário, Expedidor, Recebedor e Tomador do Serviço).
  - Componentes do frete, dados da carga (produto predominante, valor, peso bruto e volumes) e RNTRC.
- 🖨️ **Impressão e Exportação para PDF (A4):**
  - Estilos CSS `@media print` configurados no formato padrão oficial da SEFAZ.
  - Botão de geração de PDF direta no cliente com biblioteca gráfica.
- 📋 **Exportação de Dados & Chave de Acesso:**
  - Cópia instantânea da chave de acesso de 44 dígitos formatada.
  - Exportação dos dados estruturados em JSON para integrações.
- 🔒 **Zero Upload / Privacidade Total:** Nenhum arquivo XML sai da máquina do usuário.

---

## 🚀 Como Rodar Localmente

### 1. Clonar o Repositório
```bash
git clone https://github.com/marcelotpbezerra/danfe-generator-pro.git
cd danfe-generator-pro
```

### 2. Instalar Dependências
```bash
npm install
```

### 3. Iniciar Servidor Local
```bash
npm run dev
```
Acesse [http://localhost:5173](http://localhost:5173) no seu navegador.

### 4. Build de Produção
```bash
npm run build
```

---

## 👨‍💻 Autor & Conexões

Desenvolvido por **Marcelo Bezerra**  
- 🌐 Website: [marcelotpbezerra.com.br](https://marcelotpbezerra.com.br/)
- 📱 Linktree: [linktr.ee/marcelotpbezerra](https://linktr.ee/marcelotpbezerra)
- 🛠️ Git Soberano: [git.marcelotpbezerra.com.br](https://git.marcelotpbezerra.com.br/marcelo)

---

## 📄 Licença
Distribuído sob a licença MIT. Livre para uso pessoal e comercial.
EOF
