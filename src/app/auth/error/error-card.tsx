"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle } from "lucide-react";

export function ErrorCard() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const getErrorMessage = () => {
    switch (error) {
      case "Configuration":
        return "Há um problema com a configuração do servidor.";
      case "AccessDenied":
        return "Acesso negado. Você não tem permissão para acessar este recurso.";
      case "Verification":
        return "O token de verificação expirou ou já foi usado.";
      case "CredentialsSignin":
        return "Email ou senha incorretos. Por favor, tente novamente.";
      case "OAuthAccountNotLinked":
        return "Este email já está em uso com outro provedor. Tente fazer login com o método original.";
      default:
        return "Ocorreu um erro durante a autenticação. Por favor, tente novamente.";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>

          <div className="mt-3 text-center sm:mt-5">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Erro de Autenticação
            </h3>
            <div className="mt-2">
              <p className="text-sm text-gray-500">{getErrorMessage()}</p>
            </div>
          </div>

          <div className="mt-5 sm:mt-6">
            <Link
              href="/auth/login"
              className="w-full inline-flex justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Voltar ao Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}