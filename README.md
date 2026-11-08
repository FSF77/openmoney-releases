# OpenMoney - Canal Oficial de Atualizações e Downloads

Repositório público de distribuição e feed de atualização automática do **OpenMoney** para macOS.

---

## ⚡ Última Versão Disponível: **v2.3.2** (Build 130)
> *Publicada em: 08/11/2026 às 20:56*

| Arquivo | Descrição | Link Direto | Tamanho |
| :--- | :--- | :--- | :--- |
| **OpenMoney-2.3.2.zip** | Pacote oficial v2.3.2 para macOS | [📥 Download v2.3.2](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.3.2.zip) | ~4 MB |
| **version.json** | Feed de verificação automática | [🔍 Visualizar](https://raw.githubusercontent.com/FSF77/openmoney-releases/main/version.json) | < 1 KB |

### 🔐 Integridade (SHA256)
```
328fad08727dda9e069c24c0684edc75acc3f7d0f5c239773c820b081b8bbdef  OpenMoney-2.3.2.zip
```

### 📝 Notas desta Versão
build com rollback sincronismo, disponível apenas na versão flutter e web em https://openmoney.app.br, melhorias visuais, é possível incluir comentários no fluxo na última linha (saldo final cumulado)

---

## 💻 Como Instalar no macOS

### Opção 1: Instalação Automática (Recomendada)
Para instalar ou atualizar com 1 comando pelo Terminal (sem avisos do Gatekeeper):
```bash
curl -fsSL https://raw.githubusercontent.com/FSF77/openmoney-releases/main/install.sh | bash
```

### Opção 2: Download Manual
1. Baixe o pacote [OpenMoney-2.3.2.zip](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.3.2.zip).
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
