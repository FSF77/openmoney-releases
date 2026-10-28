# OpenMoney - Canal Oficial de Atualizações e Downloads

Repositório público de distribuição e feed de atualização automática do **OpenMoney** para macOS.

---

## ⚡ Última Versão Disponível: **v2.1.1** (Build 71)
> *Publicada em: 28/10/2026 às 10:23*

| Arquivo | Descrição | Link Direto | Tamanho |
| :--- | :--- | :--- | :--- |
| **OpenMoney-2.1.1.zip** | Pacote oficial v2.1.1 para macOS | [📥 Download v2.1.1](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.1.1.zip) | ~4 MB |
| **version.json** | Feed de verificação automática | [🔍 Visualizar](https://raw.githubusercontent.com/FSF77/openmoney-releases/main/version.json) | < 1 KB |

### 🔐 Integridade (SHA256)
```
45aef242b12fae62f4a5eeb1ad1ea550094cf8f6aa095fd9a36479995e331faa  OpenMoney-2.1.1.zip
```

### 📝 Notas desta Versão
Padronizar versão Swift e Flutter

---

## 💻 Como Instalar no macOS

### Opção 1: Instalação Automática (Recomendada)
Para instalar ou atualizar com 1 comando pelo Terminal (sem avisos do Gatekeeper):
```bash
curl -fsSL https://raw.githubusercontent.com/FSF77/openmoney-releases/main/install.sh | bash
```

### Opção 2: Download Manual
1. Baixe o pacote [OpenMoney-2.1.1.zip](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.1.1.zip).
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
