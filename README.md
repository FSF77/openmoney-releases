# OpenMoney - Canal Oficial de Atualizações e Downloads

Repositório público de distribuição e feed de atualização automática do **OpenMoney** para macOS.

---

## ⚡ Última Versão Disponível: **v2.0.6** (Build 68)
> *Publicada em: 27/10/2026 às 19:04*

| Arquivo | Descrição | Link Direto | Tamanho |
| :--- | :--- | :--- | :--- |
| **OpenMoney-2.0.6.zip** | Pacote oficial v2.0.6 para macOS | [📥 Download v2.0.6](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.0.6.zip) | ~4 MB |
| **version.json** | Feed de verificação automática | [🔍 Visualizar](https://raw.githubusercontent.com/FSF77/openmoney-releases/main/version.json) | < 1 KB |

### 🔐 Integridade (SHA256)
```
848a1402adb3a22336c5a9ccd418497de0f926c3a1430e428540a8965c30a9cf  OpenMoney-2.0.6.zip
```

### 📝 Notas desta Versão
Seleção múltipla de contas por checkbox no Fluxo de Caixa e Relatórios com conciliação inteligente de transferências, novo agrupador por Negócio (PF/PJ) no cadastro de contas e reformulação visual da tela de edição de contas.

---

## 💻 Como Instalar no macOS

### Opção 1: Instalação Automática (Recomendada)
Para instalar ou atualizar com 1 comando pelo Terminal (sem avisos do Gatekeeper):
```bash
curl -fsSL https://raw.githubusercontent.com/FSF77/openmoney-releases/main/install.sh | bash
```

### Opção 2: Download Manual
1. Baixe o pacote [OpenMoney-2.0.6.zip](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.0.6.zip).
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
