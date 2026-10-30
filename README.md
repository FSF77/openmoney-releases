# OpenMoney - Canal Oficial de Atualizações e Downloads

Repositório público de distribuição e feed de atualização automática do **OpenMoney** para macOS.

---

## ⚡ Última Versão Disponível: **v2.1.8** (Build 84)
> *Publicada em: 30/10/2026 às 11:16*

| Arquivo | Descrição | Link Direto | Tamanho |
| :--- | :--- | :--- | :--- |
| **OpenMoney-2.1.8.zip** | Pacote oficial v2.1.8 para macOS | [📥 Download v2.1.8](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.1.8.zip) | ~4 MB |
| **version.json** | Feed de verificação automática | [🔍 Visualizar](https://raw.githubusercontent.com/FSF77/openmoney-releases/main/version.json) | < 1 KB |

### 🔐 Integridade (SHA256)
```
0419115bcf9d190b189cdb2e48a1ce03eab5ab46413210659b4f3ded8a1ce3d1  OpenMoney-2.1.8.zip
```

### 📝 Notas desta Versão
Inclusão de logo no cadastro de conta, melhorias visuais, Fluxo de Caixa dinâmico com nova visão diária, Relatório de compras parceladas, inclusão de filtro por conta/negócio no relatório de contas a pagar e receber, Abatimento de previsões por mês atual ou por fatura

---

## 💻 Como Instalar no macOS

### Opção 1: Instalação Automática (Recomendada)
Para instalar ou atualizar com 1 comando pelo Terminal (sem avisos do Gatekeeper):
```bash
curl -fsSL https://raw.githubusercontent.com/FSF77/openmoney-releases/main/install.sh | bash
```

### Opção 2: Download Manual
1. Baixe o pacote [OpenMoney-2.1.8.zip](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.1.8.zip).
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
