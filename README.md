# OpenMoney - Canal Oficial de Atualizações e Downloads

Repositório público de distribuição e feed de atualização automática do **OpenMoney** para macOS.

---

## ⚡ Última Versão Disponível: **v2.2.1** (Build 92)
> *Publicada em: 01/11/2026 às 18:27*

| Arquivo | Descrição | Link Direto | Tamanho |
| :--- | :--- | :--- | :--- |
| **OpenMoney-2.2.1.zip** | Pacote oficial v2.2.1 para macOS | [📥 Download v2.2.1](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.2.1.zip) | ~4 MB |
| **version.json** | Feed de verificação automática | [🔍 Visualizar](https://raw.githubusercontent.com/FSF77/openmoney-releases/main/version.json) | < 1 KB |

### 🔐 Integridade (SHA256)
```
5662388d0cfb666d30eda02eaa422ca648e41469e2a8da3f7be5d7f4d9261d9e  OpenMoney-2.2.1.zip
```

### 📝 Notas desta Versão
Inclusão de filtro anual no relatório, ajuste para ocultar menu lateral  >> Anteriores: melhorias e adequação do plano de auditoria realizado entre as versões Swift e Flutter, 100% das regras iguais, Opção de zoom nas telas e relatórios para os cegos como eu, ajustes na rotina de importação que não importava categorias corretamente, opção de exportar csv na tela de lançamentos, inclusão de logo no cadastro de conta, melhorias visuais, Fluxo de Caixa dinâmico…

---

## 💻 Como Instalar no macOS

### Opção 1: Instalação Automática (Recomendada)
Para instalar ou atualizar com 1 comando pelo Terminal (sem avisos do Gatekeeper):
```bash
curl -fsSL https://raw.githubusercontent.com/FSF77/openmoney-releases/main/install.sh | bash
```

### Opção 2: Download Manual
1. Baixe o pacote [OpenMoney-2.2.1.zip](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.2.1.zip).
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
