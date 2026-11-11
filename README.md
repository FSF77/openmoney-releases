# OpenMoney - Canal Oficial de Atualizações e Downloads

Repositório público de distribuição e feed de atualização automática do **OpenMoney** para macOS.

---

## ⚡ Última Versão Disponível: **v2.4.3** (Build 154)
> *Publicada em: 11/11/2026 às 16:03*

| Arquivo | Descrição | Link Direto | Tamanho |
| :--- | :--- | :--- | :--- |
| **OpenMoney-2.4.3.zip** | Pacote oficial v2.4.3 para macOS | [📥 Download v2.4.3](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.4.3.zip) | ~5 MB |
| **version.json** | Feed de verificação automática | [🔍 Visualizar](https://raw.githubusercontent.com/FSF77/openmoney-releases/main/version.json) | < 1 KB |

### 🔐 Integridade (SHA256)
```
db70e8b6b57701dfbf8b31f64b8238c7c4543c53288f414eb14eada5086adfc1  OpenMoney-2.4.3.zip
```

### 📝 Notas desta Versão
Agora com contas em outras moedas e cotação online (beta), personalização Visual e Temas, Novo Dashboard / Cockpit Central Customizável, Navegação Desktop Flexível, Modo Tabela / Datagrid no Extrato, tela de lançamentos consolidado, versão Flutter agora com sincronismo online, versão web em https://openmoney.app.br

---

## 💻 Como Instalar no macOS

### Opção 1: Instalação Automática (Recomendada)
Para instalar ou atualizar com 1 comando pelo Terminal (sem avisos do Gatekeeper):
```bash
curl -fsSL https://raw.githubusercontent.com/FSF77/openmoney-releases/main/install.sh | bash
```

### Opção 2: Download Manual
1. Baixe o pacote [OpenMoney-2.4.3.zip](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.4.3.zip).
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
