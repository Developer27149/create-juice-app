import inquirer, { QuestionCollection } from "inquirer";

import path from "path";
import { showErrorMessage } from "./tips";

const TEMPLATE_LIST = ["juice", "react", "vue"];
export interface IConfig {
  template: string;
  description: string;
  author: string;
  port: string;
  backendApi: string;
  projectName: string;
  packageManager: "npm" | "yarn" | "pnpm";
}

export const generateConfig = async (
  projectName?: string,
  templateName?: string
) => {
  const prompts = [
    {
      type: "input",
      name: "description",
      message: "请输入项目描述",
      default: "A funny project ❤️ ",
      validate: (input) => {
        if (!input) {
          return "项目描述不能为空";
        }
        if (input.length > 1024 * 10) {
          return "项目描述不能超过10KB";
        }
        return true;
      },
    },
    {
      type: "input",
      name: "author",
      message: "请输入作者名称",
      default: process.env.USER || "佚名",
    },
    {
      type: "input",
      name: "port",
      message: "请输入开发模式端口号",
      default: 9000,
      validate: (input) => {
        if (isNaN(Number(input))) {
          return "端口号必须为数字";
        }
        if (Number(input) < 0 || Number(input) > 65535) {
          return "端口号必须在0-65535之间";
        }
        return true;
      },
    },
    {
      type: "input",
      name: "backendApi",
      message: "请输入后端接口地址",
      default: "http://localhost:3000",
    },
    {
      type: "list",
      name: "packageManager",
      message: "请选择包管理工具",
      choices: ["npm", "yarn", "pnpm"],
    },
  ] as QuestionCollection[];
  if (!projectName) {
    prompts.unshift({
      type: "input",
      name: "projectName",
      message: "请输入项目名称",
      validate: (input) => {
        if (!input) {
          return "项目名称不能为空";
        }
        return true;
      },
    });
  }

  if (templateName) {
    //  检查项目名称是否存在
    if (!TEMPLATE_LIST.includes(templateName)) {
      showErrorMessage(`模板 ${templateName} 不存在`);
      process.exit(1);
    }
  } else {
    prompts.push(
      // 选择模板
      {
        type: "list",
        name: "template",
        message: "请选择模板",
        choices: TEMPLATE_LIST,
      }
    );
  }
  const result = await inquirer.prompt<IConfig>(prompts);
  return {
    ...result,
    projectName:
      projectName ?? result.projectName === "."
        ? path.basename(process.cwd())
        : result.projectName,
    template: templateName ?? result.template,
  };
};
