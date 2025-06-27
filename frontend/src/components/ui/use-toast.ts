"use client";

import { toast as sonnerToast } from "sonner";

export const useToast = () => {
  return {
    toast: ({
      title,
      description,
      variant = "default",
      ...props
    }: {
      title?: string;
      description?: string;
      variant?: "default" | "success" | "error" | "warning" | "info";
      [key: string]: any;
    }) => {
      const message = title || description || "";
      
      switch (variant) {
        case "success":
          sonnerToast.success(message, {
            description: title ? description : undefined,
            ...props,
          });
          break;
        case "error":
          sonnerToast.error(message, {
            description: title ? description : undefined,
            ...props,
          });
          break;
        case "warning":
          sonnerToast.warning(message, {
            description: title ? description : undefined,
            ...props,
          });
          break;
        case "info":
          sonnerToast.info(message, {
            description: title ? description : undefined,
            ...props,
          });
          break;
        default:
          sonnerToast(message, {
            description: title ? description : undefined,
            ...props,
          });
          break;
      }
    },
  };
};

export const toast = ({
  title,
  description,
  variant = "default",
  ...props
}: {
  title?: string;
  description?: string;
  variant?: "default" | "success" | "error" | "warning" | "info";
  [key: string]: any;
}) => {
  const message = title || description || "";
  
  switch (variant) {
    case "success":
      sonnerToast.success(message, {
        description: title ? description : undefined,
        ...props,
      });
      break;
    case "error":
      sonnerToast.error(message, {
        description: title ? description : undefined,
        ...props,
      });
      break;
    case "warning":
      sonnerToast.warning(message, {
        description: title ? description : undefined,
        ...props,
      });
      break;
    case "info":
      sonnerToast.info(message, {
        description: title ? description : undefined,
        ...props,
      });
      break;
    default:
      sonnerToast(message, {
        description: title ? description : undefined,
        ...props,
      });
      break;
  }
}; 