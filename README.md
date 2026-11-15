# OpenMoney - Canal Oficial de Atualizações e Downloads

Repositório público de distribuição e feed de atualização automática do **OpenMoney** para macOS.

---

## ⚡ Última Versão Disponível: **v2.4.7** (Build 181)
> *Publicada em: 15/11/2026 às 12:42*

| Arquivo | Descrição | Link Direto | Tamanho |
| :--- | :--- | :--- | :--- |
| **OpenMoney-2.4.7.zip** | Pacote oficial v2.4.7 para macOS | [📥 Download v2.4.7](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.4.7.zip) | ~6 MB |
| **version.json** | Feed de verificação automática | [🔍 Visualizar](https://raw.githubusercontent.com/FSF77/openmoney-releases/main/version.json) | < 1 KB |

### 🔐 Integridade (SHA256)
```
dd8ec06517af6719e90552a4a0732300bb67e4571a6e36c45029576716856638  OpenMoney-2.4.7.zip
```

### 📝 Notas desta Versão
Novo recurso para classificar os lançamentos por tags, tela de lançamentos gerais agora permite mais filtros e edição em lotes, ajustes tela lançamentos, parâmetro para ocultar barra de inserção rápida, melhorias rotina de incluir novos lançamentos/transferências, Nova tela para controle e acompanhamentos das previsões, limite de gasto agora pode ser usado para alertar quando está gastando mais que o definido, possibilidade de usar conta e sincronismo online, contas em outras moedas e cotação online (beta), personalização Visual e Temas, Novo Dashboard Central Customizável, Navegação Desktop Flexível, Modo Tabela / Datagrid no Extrato, tela de lançamentos consolidado, versão web em https://openmoney.app.br

---

## 💻 Como Instalar no macOS

### Opção 1: Instalação Automática (Recomendada)
Para instalar ou atualizar com 1 comando pelo Terminal (sem avisos do Gatekeeper):
```bash
curl -fsSL https://raw.githubusercontent.com/FSF77/openmoney-releases/main/install.sh | bash
```

### Opção 2: Download Manual
1. Baixe o pacote [OpenMoney-2.4.7.zip](https://github.com/FSF77/openmoney-releases/raw/main/downloads/OpenMoney-2.4.7.zip).
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
