# OpenMoney - Canal Oficial de Atualizações e Downloads

Repositório público de distribuição e feed de atualização automática do **OpenMoney** para macOS.

---

## ⚡ Última Versão Disponível: **v2.2.6** (Build 109)
> *Publicada em: 04/11/2026 às 17:58*

| Arquivo | Descrição | Link Direto | Tamanho |
| :--- | :--- | :--- | :--- |
| **OpenMoney-2.2.6.zip** | Pacote oficial v2.2.6 para macOS | [📥 Download v2.2.6](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.2.6.zip) | ~4 MB |
| **version.json** | Feed de verificação automática | [🔍 Visualizar](https://raw.githubusercontent.com/FSF77/openmoney-releases/main/version.json) | < 1 KB |

### 🔐 Integridade (SHA256)
```
73a94370eb66648a0140c1b8101647a76abf46591ff0b33144a7b6e11af404ff  OpenMoney-2.2.6.zip
```

### 📝 Notas desta Versão
Ajuste regra abatimento, importar CSV carteira, bloqueio de categorias, sempre abrir a conta de crédito na fatura em aberto, melhorias na visualização no card de patrimônio >> Anteriores: Rotina para importar pastas com recibos digitalizados uso OCR local ou integração com Gemini IA, Melhorias visuais nas telas de lançamento e relatório, inclusão de filtro anual no relatório, Alterar nomes orçamento para limite de gastos…

---

## 💻 Como Instalar no macOS

### Opção 1: Instalação Automática (Recomendada)
Para instalar ou atualizar com 1 comando pelo Terminal (sem avisos do Gatekeeper):
```bash
curl -fsSL https://raw.githubusercontent.com/FSF77/openmoney-releases/main/install.sh | bash
```

### Opção 2: Download Manual
1. Baixe o pacote [OpenMoney-2.2.6.zip](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.2.6.zip).
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
