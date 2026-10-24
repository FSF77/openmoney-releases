# OpenMoney - Canal Oficial de Atualizações e Downloads

Repositório público de distribuição e feed de atualização automática do **OpenMoney** para macOS.

---

## ⚡ Última Versão Disponível: **v1.0.27** (Build 39)
> *Publicada em: 24/10/2026 às 19:29*

| Arquivo | Descrição | Link Direto | Tamanho |
| :--- | :--- | :--- | :--- |
| **OpenMoney-1.0.27.zip** | Pacote oficial v1.0.27 para macOS | [📥 Download v1.0.27](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-1.0.27.zip) | ~3 MB |
| **version.json** | Feed de verificação automática | [🔍 Visualizar](https://raw.githubusercontent.com/FSF77/openmoney-releases/main/version.json) | < 1 KB |

### 🔐 Integridade (SHA256)
```
bc9fd1c4867abdf40fd9f84531c5ab2a5ce1b61129805f4a70c9d1ef1da1fddf  OpenMoney-1.0.27.zip
```

### 📝 Notas desta Versão
Implementação da Central de Contas a Pagar e Receber, Notificações Nativas do Sistema e Lembretes de Conciliação com janela padrão de 3 dias de antecedência.

---

## 💻 Como Instalar no macOS

### Opção 1: Instalação Automática (Recomendada)
Para instalar ou atualizar com 1 comando pelo Terminal (sem avisos do Gatekeeper):
```bash
curl -fsSL https://raw.githubusercontent.com/FSF77/openmoney-releases/main/install.sh | bash
```

### Opção 2: Download Manual
1. Baixe o pacote [OpenMoney-1.0.27.zip](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-1.0.27.zip).
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
