# OpenMoney - Canal Oficial de Atualizações e Downloads

Repositório público de distribuição e feed de atualização automática do **OpenMoney** para macOS.

---

## ⚡ Última Versão Disponível: **v2.2.3** (Build 102)
> *Publicada em: 02/11/2026 às 20:02*

| Arquivo | Descrição | Link Direto | Tamanho |
| :--- | :--- | :--- | :--- |
| **OpenMoney-2.2.3.zip** | Pacote oficial v2.2.3 para macOS | [📥 Download v2.2.3](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.2.3.zip) | ~4 MB |
| **version.json** | Feed de verificação automática | [🔍 Visualizar](https://raw.githubusercontent.com/FSF77/openmoney-releases/main/version.json) | < 1 KB |

### 🔐 Integridade (SHA256)
```
fcddfcb38b001cc6477106b372178a6056e8e7c0c6336e6dc076c58c332e371e  OpenMoney-2.2.3.zip
```

### 📝 Notas desta Versão
Rotina para importar pastas com recibos digitalizados uso OCR local ou integração com Gemini IA, >> Anteriores: Melhorias visuais nas telas de lançamento e relatório, inclusão de filtro anual no relatório, Alterar nomes orçamento para limite de gastos, melhorias e adequação do plano de auditoria realizado entre as versões Swift e Flutter, 100% das regras iguais, opção de zoom, ajustes na rotina de importação, opção de exportar csv na tela de lançamentos, inclusão de logo no cadastro de conta, Fluxo de Caixa dinâmico…

---

## 💻 Como Instalar no macOS

### Opção 1: Instalação Automática (Recomendada)
Para instalar ou atualizar com 1 comando pelo Terminal (sem avisos do Gatekeeper):
```bash
curl -fsSL https://raw.githubusercontent.com/FSF77/openmoney-releases/main/install.sh | bash
```

### Opção 2: Download Manual
1. Baixe o pacote [OpenMoney-2.2.3.zip](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.2.3.zip).
2. Dê dois cliques para descompactar o `OpenMoney.app`.
3. Arraste para a pasta **/Applications**.
4. **Se o macOS exibir o aviso:** *"OpenMoney está danificado e não pode ser aberto"*
   > Esse é o comportamento padrão do macOS Gatekeeper para aplicativos distribuídos fora da Mac App Store sem certificado corporativo anual da Apple.
   
   Para liberar, basta abrir o **Terminal** e executar:
   ```bash
   xattr -cr /Applications/OpenMoney.app
   ```
   *(Ou clique com o botão direito / Control-clique no aplicativo > **Abrir** > confirmar **Abrir**).*

5. A partir de então, todas as próximas atualizações serão instaladas diretamente pelo próprio aplicativo no menu **OpenMoney > Buscar Atualizações...**.
