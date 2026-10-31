# OpenMoney - Canal Oficial de Atualizações e Downloads

Repositório público de distribuição e feed de atualização automática do **OpenMoney** para macOS.

---

## ⚡ Última Versão Disponível: **v2.2.0** (Build 88)
> *Publicada em: 31/10/2026 às 12:22*

| Arquivo | Descrição | Link Direto | Tamanho |
| :--- | :--- | :--- | :--- |
| **OpenMoney-2.2.0.zip** | Pacote oficial v2.2.0 para macOS | [📥 Download v2.2.0](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.2.0.zip) | ~4 MB |
| **version.json** | Feed de verificação automática | [🔍 Visualizar](https://raw.githubusercontent.com/FSF77/openmoney-releases/main/version.json) | < 1 KB |

### 🔐 Integridade (SHA256)
```
7f416af56b9d29c0bc5fbfd84fd8d6ec2f7fe273ef3489b47750d27fdd286bdb  OpenMoney-2.2.0.zip
```

### 📝 Notas desta Versão
Melhorias e adequação do plano de auditoria realizado entre as versões Swift e Flutter, 100% das regras iguais  >> Anteriores: Opção de zoom nas telas e relatórios para os cegos como eu, ajustes na rotina de importação que não importava categorias corretamente, opção de exportar csv na tela de lançamentos, inclusão de logo no cadastro de conta, melhorias visuais, Fluxo de Caixa dinâmico…

---

## 💻 Como Instalar no macOS

### Opção 1: Instalação Automática (Recomendada)
Para instalar ou atualizar com 1 comando pelo Terminal (sem avisos do Gatekeeper):
```bash
curl -fsSL https://raw.githubusercontent.com/FSF77/openmoney-releases/main/install.sh | bash
```

### Opção 2: Download Manual
1. Baixe o pacote [OpenMoney-2.2.0.zip](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.2.0.zip).
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
