import React, { useState, useEffect } from "react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Plus,
  Trash2,
  LogOut,
  Calendar,
  Clock,
  AlertCircle,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

const API = "http://localhost:5000/api";

export default function Todo() {
  const [todos, setTodos] = useState([]);
  const [title, setTitle] = useState("");
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [filter, setFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (token) fetchTodos();
  }, [token]);

  const fetchTodos = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API}/todos`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTodos(res.data);
      setIsLoading(false);
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const addTodo = async () => {
    if (!title.trim()) return;
    try {
      setIsLoading(true);
      await axios.post(
        `${API}/todos`,
        { title },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTitle("");
      fetchTodos();
    } catch (err) {
      console.error(err);
      setIsLoading(false);
    }
  };

  const toggleTodo = async (id, completed) => {
    try {
      const updatedTodos = todos.map((todo) =>
        todo.id === id ? { ...todo, completed: !completed } : todo
      );
      setTodos(updatedTodos);

      await axios.put(
        `${API}/todos/${id}`,
        { completed: !completed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchTodos();
    } catch (err) {
      console.error(err);
      fetchTodos();
    }
  };

  const deleteTodo = async (id) => {
    try {
      const updatedTodos = todos.filter((todo) => todo.id !== id);
      setTodos(updatedTodos);

      await axios.delete(`${API}/todos/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error(err);
      fetchTodos();
    }
  };

  const login = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    try {
      setIsLoading(true);
      const res = await axios.post(`${API}/auth/login`, { email, password });
      localStorage.setItem("token", res.data.token);
      setToken(res.data.token);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      alert("Login failed. Please check your credentials.");
    }
  };

  const register = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    try {
      setIsLoading(true);
      await axios.post(`${API}/auth/register`, { email, password });
      login(e);
    } catch (err) {
      setIsLoading(false);
      alert("Registration failed. This email might already be in use.");
    }
  };

  const filteredTodos = todos.filter((todo) => {
    if (filter === "all") return true;
    if (filter === "active") return todo.completed === 0;
    if (filter === "completed") return todo.completed === 1;
    return true;
  });

  const completedCount = todos.filter((todo) => todo.completed === 1).length;
  const progress = todos.length > 0 ? (completedCount / todos.length) * 100 : 0;

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <Card className="backdrop-blur-md bg-white/10 border-0 shadow-2xl">
            <CardHeader className="space-y-1 pb-2">
              <motion.div
                initial={{ scale: 0.95 }}
                animate={{ scale: 1 }}
                className="flex justify-center mb-2"
              >
                <span className="w-12 h-12 rounded-full bg-gradient-to-br from-violet-500 to-indigo-700 flex items-center justify-center">
                  <Check className="w-6 h-6 text-white" />
                </span>
              </motion.div>
              <CardTitle className="text-2xl font-bold text-center text-white">
                TaskMaster
              </CardTitle>
              <p className="text-center text-gray-300 text-sm">
                Sign in to manage your tasks efficiently
              </p>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid grid-cols-2 mb-4 bg-white/5">
                  <TabsTrigger
                    value="login"
                    className="text-sm data-[state=active]:bg-white/10"
                  >
                    Login
                  </TabsTrigger>
                  <TabsTrigger
                    value="register"
                    className="text-sm data-[state=active]:bg-white/10"
                  >
                    Register
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                  <form onSubmit={login} className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        placeholder="Email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      />
                      <Input
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
                    >
                      {isLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </form>
                </TabsContent>
                <TabsContent value="register">
                  <form onSubmit={register} className="space-y-4">
                    <div className="space-y-2">
                      <Input
                        placeholder="Email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      />
                      <Input
                        type="password"
                        placeholder="Password"
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="h-12 bg-white/5 border-white/10 text-white placeholder:text-gray-400"
                      />
                    </div>
                    <Button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-12 bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white border-0"
                    >
                      {isLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-900 dark:to-slate-800">
      <div className="max-w-4xl mx-auto p-6">
        <header className="mb-8">
          <div className="flex justify-between items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-700 flex items-center justify-center">
                  <Check className="w-4 h-4 text-white" />
                </span>
                TaskMaster
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
                {new Date().toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </motion.div>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => {
                  localStorage.removeItem("token");
                  setToken("");
                }}
                variant="outline"
                size="sm"
                className="flex items-center gap-1 text-slate-600 dark:text-slate-300"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </Button>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Card className="bg-white dark:bg-slate-800 shadow-md p-3">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Total Tasks
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">
                  {todos.length}
                </div>
              </Card>
              <Card className="bg-white dark:bg-slate-800 shadow-md p-3">
                <div className="text-sm text-slate-500 dark:text-slate-400">
                  Completed
                </div>
                <div className="text-2xl font-bold text-slate-800 dark:text-white">
                  {completedCount}
                </div>
              </Card>
            </div>

            <div className="w-36">
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-500 dark:text-slate-400">
                  Progress
                </span>
                <span className="font-medium text-indigo-600 dark:text-indigo-400">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          </div>
        </header>

        <Card className="mb-8 bg-white dark:bg-slate-800 shadow-lg border-0">
          <CardContent className="p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addTodo();
              }}
              className="flex gap-3"
            >
              <Input
                placeholder="Add a new task..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-12 bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600"
              />
              <Button
                type="submit"
                disabled={!title.trim() || isLoading}
                className="h-12 px-6 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white border-0"
              >
                <Plus className="mr-2 w-4 h-4" /> Add Task
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="mb-6 flex items-center justify-between">
          <Tabs value={filter} onValueChange={setFilter} className="w-full">
            <TabsList className="bg-white dark:bg-slate-800 p-1 shadow-md">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-slate-700"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="active"
                className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-slate-700"
              >
                Active
              </TabsTrigger>
              <TabsTrigger
                value="completed"
                className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-slate-700"
              >
                Completed
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {isLoading && todos.length === 0 ? (
          <div className="text-center py-12">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-8 w-8 bg-slate-200 dark:bg-slate-700 rounded-full mb-4"></div>
              <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-3"></div>
              <div className="h-3 w-24 bg-slate-200 dark:bg-slate-700 rounded"></div>
            </div>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {filteredTodos.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <AlertCircle className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-700 dark:text-slate-300">
                  {filter === "all"
                    ? "No tasks yet"
                    : filter === "active"
                    ? "No active tasks"
                    : "No completed tasks"}
                </h3>
                <p className="text-slate-500 dark:text-slate-400 mt-1">
                  {filter === "all"
                    ? "Add a new task to get started"
                    : filter === "active"
                    ? "All your tasks are completed"
                    : "Complete some tasks to see them here"}
                </p>
              </motion.div>
            ) : (
              <ul className="space-y-3">
                {filteredTodos.map((todo, index) => (
                  <motion.li
                    key={todo.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      "bg-white dark:bg-slate-800 rounded-lg shadow-md border-l-4",
                      todo.completed === 1
                        ? "border-l-green-500"
                        : "border-l-indigo-500"
                    )}
                  >
                    <div className="p-4 flex items-center justify-between gap-3">
                      <div
                        className="flex items-center gap-3 flex-1 cursor-pointer"
                        onClick={() => toggleTodo(todo.id, todo.completed)}
                      >
                        <div className="relative flex-shrink-0">
                          <div
                            className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors",
                              todo.completed === 1
                                ? "border-green-500 bg-green-500 bg-opacity-20"
                                : "border-indigo-400"
                            )}
                          >
                            {todo.completed === 1 && (
                              <Check className="w-4 h-4 text-green-500" />
                            )}
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p
                            className={cn(
                              "text-slate-800 dark:text-slate-200 font-medium truncate transition-all",
                              todo.completed === 1 &&
                                "line-through text-slate-400 dark:text-slate-500"
                            )}
                          >
                            {todo.title}
                          </p>
                          <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-1 space-x-2">
                            <span className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              {todo.created_at
                                ? formatDate(todo.created_at)
                                : "Just now"}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteTodo(todo.id)}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-400 rounded-lg p-2"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.li>
                ))}
              </ul>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
