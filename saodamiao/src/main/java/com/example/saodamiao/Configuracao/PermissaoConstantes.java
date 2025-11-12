package com.example.saodamiao.Configuracao;

public final class PermissaoConstantes {

    private PermissaoConstantes() {}

    //Papéis (Roles)
    //Usado para papéis gerais de usuário.
    public static final String ROLE_ADMIN = "ROLE_ADMIN";
    public static final String ROLE_GESTOR = "ROLE_GESTOR";
    public static final String ROLE_COLABORADOR = "ROLE_COLABORADOR";

    //Autoridades (Authorities)Nomes de ações específicas
    //Usado para permissões de ação.
    public static final String VENDA_BAZAR = "VENDA_BAZAR";
    public static final String GERENCIAR_CESTAS = "GERENCIAR_CESTAS";
    public static final String GERENCIAR_ESTOQUE = "GERENCIAR_ESTOQUE";

    // ae rapaziada fiquem a vontade de criar mais permissoes aqui

}